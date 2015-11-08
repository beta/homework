var computeDateDifference = function (date) {
  var dateNow = Date.now();
  return Math.round((date - dateNow) / (1000 * 60 * 60 * 24));
}

var parseIssues = function (issueList) {
  var homeworkList = [];
  issueList.forEach(function (issue) {
    var homework = jsyaml.safeLoad(issue.body.substring(0, issue.body.indexOf('---')));
    
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
      homework.timestamp = Date.parse(homework.deadline);
    }
    
    homeworkList.push(homework);
  });
  return homeworkList;
};

var getHomeworkList = function (options) {
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
      var homeworkList = parseIssues(data);
      options.success(homeworkList);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      options.error(jqXHR, textStatus, errorThrown);
    }
  });
};

var sortHomeworkList = function (homeworkList) {
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
    }
    
    // TODO: put homeworks in different categories.
  });
  
  return sortedHomeworkList;
};

getHomeworkList({
  success: function (homeworkList) {
    console.log(homeworkList);
  },
  error: function (jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
  }
});
