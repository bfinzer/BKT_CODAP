/* jshint indent: false, strict: false, quotmark: false, browser: true, devel: true */
/* globals iframePhone */
var BKT = {

  codapPhone: null,

  initGame: function() {

    // Invoke the JavaScript interface

    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function() {}, "codap-game", window.parent);

    this.codapPhone.call({
      action: 'initGame',
      args: {
        name: "BKT",
        version: "0.1",
        dimensions: { width: 200, height: 150 },
        collections: [
          {
            name: "Students",
            attrs: [
              { name: "student", type: 'nominal', description: "The student name" },
              { name: "Initial Knowledge", type: 'numeric', description: "", precision: 2 },
              { name: "Transition Parameter", type: 'numeric', description: "", precision: 2 },
              { name: "Slip Parameter", type: 'numeric', description: "", precision: 2 },
              { name: "Guess Parameter", type: 'numeric', description: "", precision: 2 }
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
              { name: "time (sec)", type: 'numeric', description: "", precision: 2 },
              { name: "knowledge", type: 'numeric', description: "", precision: 2 }
            ],
            labels: {
              singleCase: "trace",
              pluralCase: "traces",
              singleCaseWithArticle: "a trace",
              setOfCases: "analysis",
              setOfCasesWithArticle: "an analysis"
            },
            defaults: {
              xAttr: "time (sec)",
              yAttr: "knowledge"
            }
          }
        ]
      }
    }, function() {
//      this.setupNewGame();
    }.bind(this));
  },

  addCase: function(callback) {

    var createCase = function() {
      this.codapPhone.call({
        action: 'createCase',
        args: {
          collection: "Trials",
          parent: this.openRoundID,
          values: [ this.trialNum, this.guess, this.result ]
        }
      });
      callback();
    }.bind(this);

    if( ! this.openRoundID ) {
      // Start a new Games case if we don't have one open
      this.codapPhone.call({
          action: 'openCase',
          args: {
            collection: "Games",
            values: [ this.gameNum, this.trialNum ]
          }
        }, function(result) {
          if( result.success) {
            this.openRoundID = result.caseID;
            createCase();
          } else {
            console.log("BKT: Error calling 'openCase'"); // alert the user? Bail?
          }
        }.bind(this));
    } else {
      this.codapPhone.call({
        action: 'updateCase',
        args: {
          collection: "Games",
          caseID: this.openRoundID,
          values: [ this.gameNum, this.trialNum ]
        }
      }, createCase);
    }
  },

  addGame: function() {
    if (this.openRoundID) {
      this.codapPhone.call({
        action: 'closeCase',
        args: {
          collection: "Games",
          caseID: this.openRoundID,
          values: [ this.gameNum, this.trialNum ]
        }
      });
      // Since we are assuming closeCase will succeed, immediately forget the previously open round.
      this.openRoundID = null;
    }
  },

  //setupNewGame: function() {
  //  this.gameNum++;
  //
  //  this.chooseNumber();
  //  this.trialNum = 0;
  //  this.currRangeMin = 0;
  //  this.currRangeMax = this.absRangeMax;
  //},

  changeStudent: function() {

    function processData( iResponse, textStatus, jqXHR) {
      console.log('got response');
    }

    // Send request to BKT server
    var kURL = 'https://griffin.ucsc.edu/bkt?student="anon"';
    jQuery.post( kURL, 'Student', processData )
  }

  //processGuess: function(iGuess, callback) {
  //
  //  this.trialNum++;
  //  this.guess = iGuess;
  //
  //  if (Number(iGuess) === this.secret) {
  //    this.result = "Got it!";
  //  }
  //  else if (iGuess < this.secret) {
  //    this.result = "Too low";
  //    this.currRangeMin = Math.max( this.currRangeMin, iGuess + 1);
  //  }
  //  else if (iGuess > this.secret) {
  //    this.result = "Too high";
  //    this.currRangeMax = Math.min( this.currRangeMax, iGuess - 1);
  //  }
  //  else {
  //    this.result = "Guess again";
  //  }
  //
  //  this.addCase(callback);
  //},

  //userGuess: function(){
  //  var guess = Number(document.forms.form1.num.value);
  //  document.forms.form1.enter.disabled = true;
  //
  //  this.processGuess(guess, function() {
  //    alert(this.result);
  //    document.forms.form1.enter.disabled = false;
  //
  //    if (guess === this.secret) {
  //      this.addGame();
  //      this.setupNewGame();
  //    }
  //  }.bind(this));
  //}

  //autoGuess: function() {
  //
  //  var makeNextGuess = function() {
  //    var currRange = this.currRangeMax - this.currRangeMin;
  //    var guess = this.currRangeMin + Math.floor(Math.random() * currRange);
  //
  //    this.processGuess(guess, function() {
  //      if (this.guess === this.secret) {
  //        this.addGame();
  //        this.setupNewGame();
  //      } else {
  //        makeNextGuess();
  //      }
  //    }.bind(this));
  //
  //  }.bind(this);
  //
  //  makeNextGuess();
  //}
};

BKT.initGame();
