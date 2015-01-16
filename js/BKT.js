/* jshint indent: false, strict: false, quotmark: false, browser: true, devel: true */
/* globals iframePhone */
var BKT = {

  codapPhone: null,

  kDataDescription: {
    name: "BKT",
    version: "0.1",
    dimensions: {width: 300, height: 150},
    collections: [
      {
        name: "Students",
        attrs: [
          {name: "student", type: 'nominal', description: "The student name"},
          {name: "Initial Knowledge", type: 'numeric', description: "", precision: 2},
          {name: "Transition Parameter", type: 'numeric', description: "", precision: 2},
          {name: "Slip Parameter", type: 'numeric', description: "", precision: 2},
          {name: "Guess Parameter", type: 'numeric', description: "", precision: 2},
          {name: "M Parameter", type: 'numeric', description: "", precision: 2}
        ],
        childAttrName: "Tracing",
        labels: {
          singleCase: "student",
          pluralCase: "students",
          singleCaseWithArticle: "a student",
          setOfCases: "class",
          setOfCasesWithArticle: "a class"
        }
      },
      {
        name: "Traces",
        attrs: [
          {name: "time (sec)", type: 'numeric', description: "", precision: 2},
          {name: "knowledge", type: 'numeric', description: "", precision: 2, min: 0, max: 1 }
        ],
        labels: {
          singleCase: "trace",
          pluralCase: "traces",
          singleCaseWithArticle: "a trace",
          setOfCases: "analysis",
          setOfCasesWithArticle: "an analysis"
        },
        defaults: {
          xAttr: "time",
          yAttr: "knowledge"
        }
      }
    ]
  },

  startPhone: function () {
    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function () {
    }, "codap-game", window.parent);
  },

  initGame: function (iDataDescription) {
    this.codapPhone.call({
      action: 'initGame',
      args: iDataDescription
    }, function () {
      this.codapPhone.call( {
            action: 'createComponent',
            args: {
              type: 'DG.TableView',  // or 'DG.GraphView', 'DG.SliderView', 'DG.TextView', 'DG.CalculatorView'
              log: false
            }
          }
      );
      this.codapPhone.call( {
            action: 'createComponent',
            args: {
              type: 'DG.GraphView',  // or 'DG.GraphView', 'DG.SliderView', 'DG.TextView', 'DG.CalculatorView'
              log: false
            }
          }
      );
    }.bind(this));
  },

// Format of the data for the BKT situation
//{
//  "name": "Students",
//    "attrs": [
//  "student",
//  "Initial Knowledge",
//  "Transition Parameter",
//  "Slip Parameter",
//  "Guess Parameter",
//  "M Parameter",
//  "Trace"
//],
//    "cases": [
//  {
//    "student": "name",
//    "Initial Knowledge": 0,
//    "Transition Parameter": 0,
//    "Slip Parameter": 0,
//    "M Parameter": 0,
//    "Trace": {
//      "name": "trace",
//      "attrs": [
//        "time",
//        "knowledge"
//      ],
//      "cases": [
//        {
//          "time": 0,
//          "knowledge": 0
//        },
//        {
//          "time": 0,
//          "knowledge": 0
//        }
//      ]
//    }
//  }
//]
//}

  requestData: function () {

    var addTrace = function (iParentID, iTrace) {
      iTrace.cases.forEach(function (iTick) {
        this.codapPhone.call({
          action: 'createCase',
          args: {
            collection: "trace",
            parent: iParentID,
            values: [iTick.time, iTick.knowledge]
          }
        });
      }.bind(this));
    }.bind(this);

    var addStudent = function (iStudent) {
      this.codapPhone.call({
        action: 'openCase',
        args: {
          collection: "Students",
          values: [iStudent["student"], iStudent["Initial Knowledge"], iStudent["Transition Parameter"],
            iStudent["Slip Parameter"], iStudent["Guess Parameter"], iStudent["M Parameter"]]
        }
      }, function (result) {
        if (result.success) {
          addTrace(result.caseID, iStudent["Trace"]);
        } else {
          console.log("BKT: Error calling 'openCase'"); // alert the user? Bail?
        }
      }.bind(this));
    }.bind(this);

    var processData = function (iData) {
      iData.cases.forEach(function (iStudent) {
        addStudent(iStudent);
      });
    }.bind(this);

    // Send request to BKT server
    var kURL = 'https://griffin.ucsc.edu/bkt?student="anon"';
    jQuery.getJSON(kURL, processData);
  }

};

BKT.startPhone();
BKT.initGame(BKT.kDataDescription);
