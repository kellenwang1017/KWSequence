var myScene;
var myZoneTop;
var myZoneBottom;
var mySequence;
var myBrush;
var myLine;
var myHeights;
var myTime;
var myURL;
var mySRC;
var myX;
var myY;

var SIG_GAP    = 10;
var SIG_HEIGHT = 14;
var SIG_WIDTH  = 9;
var PIC_HEIGHT = 200;
var PIC_WIDTH = 375;
var PIC_FRAMEON = true;
var PIC_COLOR = false;
var PIC_FONT = 18;

window.onload = function initGame() {
    rstSys();
}


function rstSys() {
    var save = "ns#10    +   +   +   +   +   +   +   +   +\n10ns@7              |   |\nclk =::__~~__~~__~~__~~__~~__~~__~~__~~__\ncsn=::~~~~______________________~~~~~~~~\nwen=~~~~~~~~~~____~~~~~~~~~~~~~~~~~~~~~~\nale=~~~~~~~~~~____~~~~~~~~~~~~~~~~~~~~~~\nad=---------<addr>--< data  >----------\nwaitn=~~~~~~\\  \\________/   /~~~~~~~~~~~~~"
    if(mySequence != null) {
      save = mySequence.value;
    }
    myScene = document.getElementById("projectShowCase");
    myScene.width = PIC_WIDTH;
    myScene.height = PIC_HEIGHT;
    myZoneTop = document.getElementById("projectZoneTop");
    myZoneTop.innerHTML = ""+
       "<p>Copyright (c) mail@kellen.wang</p>"+
       "<p>KWSequence v1.1</p>"+
       "<textarea id='sequence' oninput='runSys()' rows='10' cols='56' wrap='off' style='font-size:12px; font:\'Courier New\';'></textarea>"+
       "<br>"+
       "<input type='button' value='+' onclick='zoom(true)'>"+
       "<input type='button' value='-' onclick='zoom(false)'>"+
       "<input type='button' value='<' onclick='setting(0)'>"+
       "<input type='button' value='v' onclick='setting(3)'>"+
       "<input type='button' value='^' onclick='setting(2)'>"+
       "<input type='button' value='>' onclick='setting(1)'>"+
       "<input type='button' value='F' onclick='setting(4)'>"+
       "<input type='button' value='C' onclick='setting(5)'>"+
    "";
    myZoneBottom = document.getElementById("projectZoneBottom");
    myZoneBottom.innerHTML = ""+
       "<input type='button' value='Save Image' onclick='getURL()'>"+
       "<br>"+
       "<textarea id='imgUrl' hidden='true' rows='3' cols='56' wrap='soft' style='font-size:12px; font:\'Courier New\';'></textarea>"+ 
       "<img id='imgSrc' hidden='true'/>"+
    "";
    myURL = document.getElementById("imgUrl");
    mySRC = document.getElementById("imgSrc");
    mySequence = document.getElementById("sequence");
    mySequence.value = save;
    myBrush = myScene.getContext("2d");
    runSys();
}

function runSys() {
    clearScene();
   if(PIC_FRAMEON) {
      myBrush.beginPath();
      myBrush.strokeStyle = "black";
      myBrush.strokeRect(0,0,myScene.width,myScene.height);
      myBrush.closePath();
   }
   var sequences = mySequence.value.split(/\n/);
   var signals = [];
   var margin = 0;
   var width = 0;
   var height = 0;
   for(var i in sequences) {
      var signal = new KWSig(sequences[i]);
      if(margin < signal.name.length) {
         margin = signal.name.length;
      }
      if(width < signal.wave.length) {
         width = signal.wave.length;
      }
      height ++;
      signals.push(signal);
   }
   //autoFrame((margin + width) * (SIG_WIDTH) + SIG_GAP*4, height * (SIG_HEIGHT + SIG_GAP) + SIG_GAP*2);
   for(var i in signals) {
      if(signals[i].isTime) {
         dispTime(signals[i].name, signals[i].wave, margin, signals[i].step);
      }
   }
   for(var i in signals) {
      if(signals[i].isSignal) {
         dispSignal(signals[i].name, signals[i].wave, margin);
      } else if(signals[i].isLine) {
         dispLine(signals[i].string);
      }
   }
   for(var i in signals) {
      if(signals[i].isMark) {
         dispMark(signals[i].name, signals[i].wave, margin, signals[i].line);
      }
   }
}

function dispTime(theName, theWave, theMargin, theStep) {
   var sigPos = PIC_FONT/2 * theMargin + SIG_GAP + 10;
   myLine += SIG_HEIGHT + SIG_GAP;
   myHeights.push(myLine);
   myTime = 0;
   for(var i in theWave) {
      sigPos += SIG_WIDTH;
      switch(theWave[i]) {
         case '+':
            myTime += theStep;
            drawLine('gray',0, sigPos, myLine-SIG_HEIGHT/2,sigPos, myLine-SIG_HEIGHT/2+10);
            drawLine('gray',0, sigPos, myLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT/2);
            myBrush.font = (PIC_FONT/2).toString()+"px Courier New";
            myBrush.fillText(myTime+theName, sigPos, myLine-SIG_HEIGHT/2-8);
            myBrush.font = PIC_FONT.toString()+"px Courier New";
            break;
         default:
            drawLine('gray',0, sigPos, myLine-SIG_HEIGHT/2,sigPos, myLine-SIG_HEIGHT/2+5);
            drawLine('gray',0, sigPos, myLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT/2);
            break;
      }
   }
}

function dispMark(theName, theWave, theMargin, theIndex) {
   var sigPos = PIC_FONT/2 * theMargin + SIG_GAP + 10;
   var openMark = false;
   var startPos = 0;
   var endPos = 0;
   var theLine = myHeights[theIndex-1];
   for(var i in theWave) {
      sigPos += SIG_WIDTH;
      switch(theWave[i]) {
         case '|':
            var dashStyle = myBrush.getLineDash();
            myBrush.setLineDash([2]);
            drawLine('gray',0, sigPos, 0,sigPos, myScene.height);
            myBrush.setLineDash(dashStyle);
            if(openMark == false) {
               startMark = sigPos;
               openMark = true;
               drawLine('black',0, sigPos, theLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH, theLine-SIG_HEIGHT/2);
               drawLine('black',0, sigPos, theLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH*0.5, theLine-SIG_HEIGHT*0.75);
               drawLine('black',0, sigPos, theLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH*0.5, theLine-SIG_HEIGHT*0.25);
            } else {
               endMark = sigPos;
               openMark = false;
               drawLine('black',0, sigPos-SIG_WIDTH, theLine-SIG_HEIGHT/2,sigPos, theLine-SIG_HEIGHT/2);
               drawLine('black',0, sigPos-SIG_WIDTH*0.5, theLine-SIG_HEIGHT*0.75,sigPos, theLine-SIG_HEIGHT/2);
               drawLine('black',0, sigPos-SIG_WIDTH*0.5, theLine-SIG_HEIGHT*0.25,sigPos, theLine-SIG_HEIGHT/2);
               myBrush.fillText(theName, (endMark+startMark)/2, theLine-SIG_HEIGHT);
            }
            break;
         default:
            if(openMark) {
               drawLine('black',0, sigPos, theLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH, theLine-SIG_HEIGHT/2);
            }
            break;
      }
   }
}

function dispSignal(theName, theWave, theMargin) {
   var sigPos = PIC_FONT/2 * theMargin + SIG_GAP + 10;
   var openBus = false;
   var lastSlop = '-';
   var lastSlopPos = 0;
   var attach = false;
   myLine += SIG_HEIGHT + SIG_GAP;
   myHeights.push(myLine);
   myBrush.textAlign = 'left';
   myBrush.fillText(theName, SIG_GAP, myLine-SIG_HEIGHT/2);
   myBrush.textAlign = 'center';
   for(var i = 0; i < theWave.length; i++) {
      sigPos += SIG_WIDTH;
      switch(theWave[i]) {
         case '~':
            drawLine('green',attach, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            break;
         case '_':
            drawLine('green',attach, sigPos, myLine,sigPos+SIG_WIDTH, myLine);
            break;
         case '-':
            drawLine('yellow',attach, sigPos, myLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT/2);
            break;
         case '/':
            if(lastSlop == '/') {
               drawLine('green',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
               drawLine('green',0, lastSlopPos, myLine,sigPos, myLine);
               drawLine('green',0, lastSlopPos+SIG_WIDTH, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            } else {
               drawLine('green',attach, sigPos, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            }
            lastSlop = '/';
            lastSlopPos = sigPos;
            break;
         case '\\':
            if(lastSlop == '\\') {
               drawLine('green',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine);
               drawLine('green',0, lastSlopPos, myLine-SIG_HEIGHT,sigPos, myLine-SIG_HEIGHT);
               drawLine('green',0, lastSlopPos+SIG_WIDTH, myLine,sigPos+SIG_WIDTH, myLine);
            } else {
               drawLine('green',attach, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine);
            }
            lastSlop = '\\'
            lastSlopPos = sigPos;
            break;
         case '[':
            openBus = true;
            drawLine('blue',0, sigPos, myLine,sigPos, myLine-SIG_HEIGHT);
            drawLine('blue',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine);
            break;
         case ']':
            openBus = false;
            drawLine('blue',0, sigPos+SIG_WIDTH, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            drawLine('blue',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine);
            break;
         case '<':
            openBus = true;
            drawLine('blue',0, sigPos, myLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            drawLine('blue',0, sigPos, myLine-SIG_HEIGHT/2,sigPos+SIG_WIDTH, myLine);
            break;
         case '>':
            openBus = false;
            drawLine('blue',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT/2);
            drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT/2);
            break;
         case '*':
            openBus = true;
            drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            drawLine('blue',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine);
            break;
         case '$':
            //drawLine('blue',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            //drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine);
            drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH/2, myLine-SIG_HEIGHT);
            drawLine('blue',0, sigPos+SIG_WIDTH/2, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            break;
         case ':':
            if(theWave[i-1] != ':') {
               drawLine('red',0, sigPos, myLine,sigPos, myLine-SIG_HEIGHT);
            }
            if(theWave[i+1] != ':') {
               drawLine('red',0, sigPos+SIG_WIDTH, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            }
            drawLine('red',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            drawLine('red',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine);
            drawLine('red',0, sigPos, myLine,sigPos+SIG_WIDTH/2, myLine-SIG_HEIGHT);
            drawLine('red',0, sigPos+SIG_WIDTH/2, myLine,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
            break;
         case ' ':
            if(openBus) {
               drawLine('blue',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
               drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine);
            } else {
               drawLine('blue',0, sigPos+SIG_WIDTH, myLine,sigPos+SIG_WIDTH, myLine);
            }
            break;
         default:
            if(openBus) {
               myBrush.textAlign = 'left';
               myBrush.fillText(theWave[i],sigPos, myLine-SIG_HEIGHT/2);
               myBrush.textAlign = 'middile';
               drawLine('blue',0, sigPos, myLine-SIG_HEIGHT,sigPos+SIG_WIDTH, myLine-SIG_HEIGHT);
               drawLine('blue',0, sigPos, myLine,sigPos+SIG_WIDTH, myLine);
            } else {
               myBrush.fillText(theWave[i],sigPos, myLine);
            }
            break;
      }
      attach = true;
   }
}

function dispLine(theLine) {
   myLine += PIC_FONT*0.6 + 2;
   myHeights.push(myLine);
   myBrush.textAlign = 'left';
   myBrush.font = (PIC_FONT * 0.6).toString()+"px Courier New";
   myBrush.fillText(theLine, 0, myLine);
   myBrush.font = PIC_FONT.toString()+"px Courier New";
   myBrush.textAlign = 'center';
}

function drawLine(style,attach, sx,sy,ex,ey) {
   if(PIC_COLOR) {
      myBrush.strokeStyle = style;
   } else {
      myBrush.strokeStyle = 'black';
   }
   myBrush.beginPath();
   myBrush.moveTo(myX,myY);
   if(attach) {
      myBrush.lineTo(sx,sy);
      myBrush.stroke();
   } else {
      myBrush.moveTo(sx,sy);
   }
   myBrush.lineTo(ex,ey);
   myBrush.stroke();
   myBrush.closePath();
   myX = ex;
   myY = ey;
}

function getURL() {
   var url = myScene.toDataURL();
   myURL.value = "<img src='"+url+"'/>";
   mySRC.src = url;
   myURL.hidden = false;
   mySRC.hidden = false;
   return url;
}

function clearScene() {
    myLine = 0;
    myTime = 0;
    myHeights = [];
    myX = 0;
    myY = 0;
    myBrush.clearRect(0,0,myScene.width,myScene.height);
    myBrush.textAlign = 'center';
    myBrush.textBaseline = 'middle';
    myBrush.font = PIC_FONT.toString()+"px Courier New";
    myBrush.fillStyle = "black";
}

function zInt(num, length) {
   return ( "0000000000000000" + num ).substr( -length );
}

function KWSig(theSignal) {
   this.string = theSignal;
   this.line = 0;
   this.isSignal = false;
   this.isMark = false;
   this.isTime = false;
   this.isLine = false;
   var index = 0;
   if(theSignal.match(/\s*[\w\d]+\s*=/)) {
      this.isSignal = true;
      for(var i in theSignal) {
         if(theSignal[i] == '=') {
            break;
         } else {
            index ++;
         }
      }
      this.name = theSignal.substring(0,index);
      this.wave = theSignal.substring(index+1,theSignal.length);
   } else if(theSignal.match(/\s*[\w\d]+\s*@/)) {
      this.isMark = true;
      for(var i in theSignal) {
         if(theSignal[i] == '@') {
            break;
         } else {
            index ++;
         }
      }
      this.name = theSignal.substring(0,index);
      this.wave = theSignal.substring(index+1,theSignal.length);
      if(theSignal.match(/@[\d]+/)) {
         index = 0;
         for(var i in this.wave) {
            if(!this.wave[i].match(/\d/)) {
               break;
            } else {
               index ++;
            }
         }
      }
      this.line = parseInt(this.wave.substring(0,index));
      this.wave = this.wave.substring(index,this.wave.length);
   } else if(theSignal.match(/\s*[\w\d]+\s*#/)) {
      this.isTime = true;
      for(var i in theSignal) {
         if(theSignal[i] == '#') {
            break;
         } else {
            index ++;
         }
      }
      this.name = theSignal.substring(0,index);
      this.wave = theSignal.substring(index+1,theSignal.length);
      if(theSignal.match(/@[\d]+/)) {
         index = 0;
         for(var i in this.wave) {
            if(!this.wave[i].match(/\d/)) {
               break;
            } else {
               index ++;
            }
         }
      }
      this.step = parseInt(this.wave.substring(0,index));
      this.wave = this.wave.substring(index,this.wave.length);
   } else {
      this.isLine = true;
      this.name = theSignal.substring(0,index);
      this.wave = theSignal.substring(index+1,theSignal.length);
   }
   while(this.name.match(/\s/)) {
      this.name = this.name.replace(' ','');
   }
}

function zoom(larger) {
   if(larger) {
      SIG_GAP += 0;
      SIG_HEIGHT += 2;
      SIG_WIDTH += 1;
   } else {
      SIG_GAP -= 0;
      SIG_HEIGHT -= 2;
      SIG_WIDTH -= 1;
   }
   runSys();
}

function setting(mode) {
   if(mode == 0) {
      PIC_WIDTH -= 10;
   } else if(mode == 1){
      PIC_WIDTH += 10;
   } else if(mode == 2){
      PIC_HEIGHT -= 10;
   } else if(mode == 3){
      PIC_HEIGHT += 10;
   } else if(mode == 4){
      if(PIC_FRAMEON) {
         PIC_FRAMEON = false;
      } else {
         PIC_FRAMEON = true;
      }
   } else if(mode == 5){
      if(PIC_COLOR) {
         PIC_COLOR = false;
      } else {
         PIC_COLOR = true;
      }
   }
   if(PIC_HEIGHT < 10) {
      PIC_HEIGHT = 10;
   }
   if(PIC_WIDTH < 10) {
      PIC_WIDTH = 10;
   }
   rstSys();
}

function autoFrame(theWidth, theHeight) {
   var frameChanged = false;
   if(theWidth != PIC_WIDTH) {
      PIC_WIDTH = theWidth;
      frameChanged = true;
   }
   if(theHeight != PIC_HEIGHT) {
      PIC_HEIGHT = theHeight;
      frameChanged = true;
   }
   if(frameChanged) {
      rstSys();
   }
}

function print(string) {
    console.log(string);
}
