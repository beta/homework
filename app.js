var DateUtil = {
  
  setToZeroOClock: function (date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  },
  
  computeDateDifference: function (date1, date2) {
    DateUtil.setToZeroOClock(date1);
    DateUtil.setToZeroOClock(date2);
    return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
  },
  
  computeDateDifferenceWithNow: function (date) {
    return DateUtil.computeDateDifference(new Date(), date);
  },
  
  isInThePast: function (date) {
    return (DateUtil.computeDateDifferenceWithNow(date) < 0);
  },
  
  isToday: function (date) {
    return (DateUtil.computeDateDifferenceWithNow(date) == 0);
  },
  
  isTomorrow: function (date) {
    return (DateUtil.computeDateDifferenceWithNow(date) == 1);
  },
  
  isInThisWeek: function (date) {
    DateUtil.setToZeroOClock(date);
    var now = new Date();
    var dateDifference = DateUtil.computeDateDifferenceWithNow(date);
    
    var dayOfToday = (now.getDay() == 0) ? 7 : now.getDay();
    var dayOfDate = (date.getDay() == 0) ? 7 : date.getDay();
    return (dateDifference >= 0 && dateDifference <= 6 && dayOfDate > dayOfToday);
  },
  
  isInNextWeek: function (date) {
    var now = new Date();
    var dayOfToday = (now.getDay() == 0) ? 7 : now.getDay();
    var dateDifferenceWithThisSunday = DateUtil.computeDateDifferenceWithNow(date) - (7 - dayOfToday);
    return (dateDifferenceWithThisSunday >= 1 && dateDifferenceWithThisSunday <= 7);
  },
  
  getDateDescriptor: function (date) {
    var numbers = ['日', '一', '二', '三', '四', '五', '六'];
    
    if (DateUtil.isToday(date)) {
      return "今天";
    } else if (DateUtil.isTomorrow(date)) {
      return "明天";
    } else if (DateUtil.isInThisWeek(date)) {
      return '周' + numbers[date.getDay()];
    } else if (DateUtil.isInNextWeek(date)) {
      return '下周' + numbers[date.getDay()];
    } else {
      return (date.getMonth() + 1) + '-' + date.getDate();
    }
  }
  
};

var HomeworkUtil = {
  
  parseIssue: function (issue) {
    var metadata = issue.body.substring(0, issue.body.indexOf('---'));
    var homework = jsyaml.safeLoad(metadata);
    
    homework.id = issue.number;
    homework.course = issue.title;
    homework.content = issue.body.substring(issue.body.indexOf('---') + 7);
    
    homework.labels = [];
    issue.labels.forEach(function (label) {
      homework.labels.push(label.name);
      if (label.name == 'lab') {
        homework.type = 'lab';
      } else if (label.name == 'exam') {
        homework.type = 'exam';
      }
    });
    homework.type = homework.type || 'homework';
    
    homework.url = issue.html_url;
    
    if (homework.deadline != 'end-of-term' || homework.deadline != 'unknown') {
      homework.deadlineTime = new Date(homework.deadline);
      DateUtil.setToZeroOClock(homework.deadlineTime);
    }
    
    if (homework.deadline == 'end-of-term') {
      homework.deadlineDescriptor = homework.deadlineFullDescriptor = '期末';
    } else if (homework.deadline == 'unknown') {
      homework.deadlineDescriptor = homework.deadlineFullDescriptor = '未知';
    } else {
      homework.deadlineDescriptor = DateUtil.getDateDescriptor(homework.deadlineTime);
      homework.deadlineFullDescriptor = (homework.deadlineTime.getMonth() + 1) + ' 月 ' + homework.deadlineTime.getDate() + ' 日';
      if (DateUtil.isInThisWeek(homework.deadlineTime) ||
          DateUtil.isInNextWeek(homework.deadlineTime)) {
        homework.deadlineFullDescriptor += '（' + homework.deadlineDescriptor + '）';
      }
    }
    
    return homework;
  },
  
  parseIssues: function (issues) {
    var homeworkList = [];
    issues.forEach(function (issue) {
      homeworkList.push(HomeworkUtil.parseIssue(issue));
    });
    return homeworkList;
  },
  
  parseComment: function (rawComment) {
    var comment = {
      content: rawComment.body,
      id: rawComment.id,
      url: rawComment.html_url,
      avatar: rawComment.user.avatar_url + '&s=24',
      author: rawComment.user.login,
      author_url: rawComment.user.html_url
    };
    
    return comment;
  },
  
  parseComments: function (comments) {
    var commentList = [];
    comments.forEach(function (comment) {
      commentList.push(HomeworkUtil.parseComment(comment));
    });
    return commentList;
  },
  
  getHomework: function (options) {
    options = (typeof options !== 'object') ? {} : options;
    options.id = options.id || 1;
    options.success = options.success || function (homework) {};
    options.error = options.error || function (jqXHR, textStatus, errorThrown) {};
    
    var data = {};
    if (_config.access_token != '') {
      data.access_token = _config.access_token;
    }
    
    $.ajax({
      url: 'https://api.github.com/repos/' + _config.username + '/' + _config.repo + '/issues/' + options.id,
      data: data,
      success: function (data, textStatus, jqXHR) {
        var homework = HomeworkUtil.parseIssue(data);
        options.success(homework);
      },
      error: options.error
    });
  },
  
  getComments: function (options) {
    options = (typeof options !== 'object') ? {} : options;
    options.id = options.id || 1;
    options.success = options.success || function (comments) {};
    options.error = options.error || function (jqXHR, textStatus, errorThrown) {};
    
    var data = {};
    if (_config.access_token != '') {
      data.access_token = _config.access_token;
    }
    
    $.ajax({
      url: 'https://api.github.com/repos/' + _config.username + '/' + _config.repo + '/issues/' + options.id + '/comments',
      data: data,
      success: function (data, textStatus, jqXHR) {
        var comments = HomeworkUtil.parseComments(data);
        options.success(comments);
      },
      error: options.error
    });
  },
  
  getHomeworkList: function (options) {
    options = (typeof options !== 'object') ? {} : options;
    options.success = options.success || function (homeworkList) {};
    options.error = options.error || function (jqXHR, textStatus, errorThrown) {};
    
    var data = {};
    if (_config.access_token != '') {
      data.access_token = _config.access_token;
    }
    if (_config.validation == true) {
      data.labels = _config.validation_label;
    }
    
    $.ajax({
      url: 'https://api.github.com/repos/' + _config.username + '/' + _config.repo + '/issues',
      data: data,
      success: function (data, textStatus, jqXHR) {
        var homeworkList = HomeworkUtil.parseIssues(data);
        options.success(homeworkList);
      },
      error: options.error
    });
  },
  
  sortHomeworkList: function (homeworkList) {
    var sortedHomeworkList = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      nextWeek: [],
      later: []
    };
    
    homeworkList.forEach(function (homework) {
      if (homework.deadline == 'end-of-term' || homework.deadline == 'unknown') {
        sortedHomeworkList.later.push(homework);
      } else {
        if (DateUtil.isToday(homework.deadlineTime)) {
          sortedHomeworkList.today.push(homework);
        } else if (DateUtil.isTomorrow(homework.deadlineTime)) {
          sortedHomeworkList.tomorrow.push(homework);
        } else if (DateUtil.isInThisWeek(homework.deadlineTime)) {
          sortedHomeworkList.thisWeek.push(homework);
        } else if (DateUtil.isInThePast(homework.deadlineTime)) {
          // Drop this homework.
        } else {
          sortedHomeworkList.later.push(homework);
        }
      }
    });
    
    var compareByDeadline = function (homework1, homework2) {
      if (homework1.deadline == 'end-of-term' || homework1.deadline == 'unknown') {
        return Infinity;
      } else if (homework2.deadline == 'end-of-term' || homework2.deadline == 'unknown') {
        return (-1) * Infinity;
      } else {
        return (homework1.deadlineTime - homework2.deadlineTime);
      }
    };
    
    sortedHomeworkList.today.sort(compareByDeadline);
    sortedHomeworkList.tomorrow.sort(compareByDeadline);
    sortedHomeworkList.thisWeek.sort(compareByDeadline);
    sortedHomeworkList.later.sort(compareByDeadline);
    
    return sortedHomeworkList;
  },
  
  getSortedHomeworkList: function (options) {
    return HomeworkUtil.sortHomeworkList(HomeworkUtil.getHomeworkList(options));
  }
  
};

var showSpinner = function () {
  var spinner = document.createElement('div');
  spinner.className = 'homework-spinner mdl-progress mdl-js-progress mdl-progress__indeterminate';
  componentHandler.upgradeElement(spinner);
  
  $('#main').empty();
  $('#main').append(spinner);
};

var loadAndShowHomeworkList = function () {
  HomeworkUtil.getHomeworkList({
    success: function (homeworkList) {
      window.homeworks.homeworks = [];
      homeworkList.forEach(function (homework) {
        window.homeworks.homeworks[homework.id] = homework;
      });
      
      window.homeworks.list = HomeworkUtil.sortHomeworkList(homeworkList);
      
      var ractiveIndex = new Ractive({
        el: 'main',
        template: '#list-template',
        data: {
          homeworkList: window.homeworks.list
        }
      });
      
      window.homeworks.pages.index = ractiveIndex.toHTML();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
    }
  });
};

var loadAndShowHomework = function (id) {
  HomeworkUtil.getHomework({
    id: id,
    success: function (homework) {
      window.homeworks.homeworks[id] = homework;
      
      var imageIndex = Math.floor(Math.random() * 120 + 1);
      window.ractiveDetail = new Ractive({
        el: 'main',
        template: '#detail-template',
        data: {
          homework: homework,
          comments: [],
          imageIndex: imageIndex
        }
      });
      
      window.homeworks.pages.details[id] = window.ractiveDetail.toHTML();
      window.ractiveHeader.set('course', homework.course);
      
      loadAndShowComments(id);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
    }
  });
};

var loadAndShowComments = function (id) {
  HomeworkUtil.getComments({
    id: id,
    success: function (comments) {
      window.homeworks.comments[id] = comments;
      window.ractiveDetail.set('comments', comments);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
    }
  });
};

var index = function () {
  $('title').html(_config.title);
  
  showSpinner();
  
  window.ractiveHeader.set('isDetailPage', false);
  
  window.homeworks = window.homeworks || { homeworks: [], comments: [], list: {}, pages: { details: [] } };
  if (window.homeworks.pages.index != undefined) {
    $('#main').html(window.homeworks.pages.index);
  } else {
    loadAndShowHomeworkList();
  }
};

var detail = function (id) {
  showSpinner();
  
  window.ractiveHeader.set('isDetailPage', true);
  window.ractiveHeader.set('course', '');
  
  window.homeworks = window.homeworks || { homeworks: [], comments: [], list: {}, pages: { details: [] } };
  if (window.homeworks.pages.details[id] != undefined &&
      window.homeworks.homeworks[id] != undefined) {
    $('#main').html(window.homeworks.pages.details[id]);
    $('title').html(window.homeworks.homeworks[id].course);
    window.ractiveHeader.set('course', window.homeworks.homeworks[id].course);
    
    loadAndShowComments(id);
  } else {
    loadAndShowHomework(id);
  }
};

var helpers = Ractive.defaults.data;
helpers.markdown2HTML = function (content) {
  return marked(content, {
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    }
  });
};

window.ractiveHeader = new Ractive({
  el: 'header',
  template: '#header-template',
  data: {
    isDetailPage: false,
    course: ''
  }
});

var routes = {
  '/[A-Za-z0-9-_&=]*': index,
  '/detail/:id': detail,
};

var router = new Router(routes);
router.init('/');
