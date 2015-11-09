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
    return (dateDifference >= 0 && dateDifference <= 6 && (date.getDay() >= now.getDay() || date.getDay() == 0));
  },
  isInNextWeek: function (date) {
    var now = new Date();
    var dateDifferenceWithThisSunday = DateUtil.computeDateDifferenceWithNow(date) - (7 - now.getDay());
    return (dateDifferenceWithThisSunday >= 1 && dateDifferenceWithThisSunday <= 7);
  }
};

var HomeworkUtil = {
  parseIssues: function (issueList) {
    var homeworkList = [];
    issueList.forEach(function (issue) {
      var metadata = issue.body.substring(0, issue.body.indexOf('---'));
      var homework = jsyaml.safeLoad(metadata);
      
      homework.id = issue.number;
      
      homework.course = issue.title;
      
      homework.labels = [];
      issue.labels.forEach(function (label) {
        homework.labels.push(label.name);
        if (label.name == 'lab') {
          homework.type = 'lab';
        }
      });
      homework.type = homework.type || 'homework';
      
      homework.url = issue.url;
      
      if (homework.deadline != 'end-of-term' || homework.deadline != 'unknown') {
        homework.deadlineTime = new Date(homework.deadline);
        DateUtil.setToZeroOClock(homework.deadlineTime);
      }
      
      homeworkList.push(homework);
    });
    return homeworkList;
  },
  
  getHomeworkList: function (options) {
    options = (typeof options !== 'object') ? {} : options;
    options.success = options.success || function (homeworkList) {};
    options.error = options.error || function (jqXHR, textStatus, errorThrown) {};
    
    var data = {};
    if (_config.access_token != '') {
      data.access_token = _config.access_token;
    }
    
    $.ajax({
      url: "https://api.github.com/repos/beta/homework/issues",
      data: data,
      success: function (data, textStatus, jqXHR) {
        var homeworkList = HomeworkUtil.parseIssues(data);
        options.success(homeworkList);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        options.error(jqXHR, textStatus, errorThrown);
      }
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
        } else if (DateUtil.isInNextWeek(homework.deadlineTime)) {
          sortedHomeworkList.nextWeek.push(homework);
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
        return (homework2.deadlineTime - homework1.deadlineTime);
      }
    };
    
    sortedHomeworkList.today.sort(compareByDeadline);
    sortedHomeworkList.tomorrow.sort(compareByDeadline);
    sortedHomeworkList.thisWeek.sort(compareByDeadline);
    sortedHomeworkList.nextWeek.sort(compareByDeadline);
    sortedHomeworkList.later.sort(compareByDeadline);
    
    return sortedHomeworkList;
  }
}

HomeworkUtil.getHomeworkList({
  success: function (homeworkList) {
    console.log(HomeworkUtil.sortHomeworkList(homeworkList));
  },
  error: function (jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
  }
});
