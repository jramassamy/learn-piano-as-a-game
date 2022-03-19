import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import * as Tone from 'tone';
const StartAudioContext = require('startaudiocontext');
const unmuteAudio = require('unmute-ios-audio');
declare var unmute: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
  title = 'piano';
  whiteKeyWidth = 80;
  pianoHeight = 400;
  timerSecondsBased = 4;
  timerRefresh = 4000;
  naturalNotes = ["C", "D", "E", "F", "G", "A", "B"];
  naturalNotesSharps: string[] = ["C", "D", "F", "G", "A"];
  naturalNotesFlats = ["D", "E", "G", "A", "B"];
  nameNote = `Nom de l'accord`;
  range = ["C1", "E4"];
  mySubscription: any;
  pianoSong: any;
  sound = false;
  toneLoadingState = 'LOADING';
  hideElements = false;
  gammeParameter: string = 'all';
  triadeTypeParameter: string = 'all_basics'; // 'min' | 'maj' | 'all_basics' | 'all_intermediate'
  typeExercice: string = '';
  version = '2.0.0';
  myAppURL = 'https://piano-as-a-game.herokuapp.com';
  typeNoteIntermediate = '';
  firstNoteId: number = -1;
  utils = {
    createSVGElement(el: any) {
      const element = document.createElementNS("http://www.w3.org/2000/svg", el);
      return element;
    },
    setAttributes(el: any, attrs: any) {
      for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
    },
    addTextContent(el: any, content: any) {
      el.textContent = content;
    },
    removeClassFromNodeCollection(nodeCollection: NodeListOf<Element>, classToRemove: string) {
      nodeCollection.forEach((node: Element) => {
        if (node.classList.contains(classToRemove)) {
          node.classList.remove(classToRemove);
        }
      });
    }
  }

  ngAfterViewInit() {
    unmuteAudio();
    this.test();
    this.setupPiano();
    this.initPianoSong();
    this.mySubscription = interval(this.timerRefresh).subscribe((x => {
      this.generateNotesRandomly();
    }));
  }

  touch($event: any) {
    console.log('touch', $event);
  }


  forceReload() {
    window.location.href = window.location.href;
  }

  initPianoSong() {
  }

  constructor() {
  }

  nothing() {

  }

  async soundAuthorized() {
    this.sound = !this.sound;
    this.test();
    this.pianoSong = new Tone.Sampler({
      urls: {
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
    Tone.context.resume();
    await Tone.start();
    console.log('audio is ready');
  }

  test() {
    // Create an audio context instance if WebAudio is supported
    let context = (window.AudioContext || (window as any).webkitAudioContext) ?
      new (window.AudioContext || (window as any).webkitAudioContext)() : null;
    console.log('context', context);
    // Decide on some parameters
    let allowBackgroundPlayback = false; // default false, recommended false
    let forceIOSBehavior = false; // default false, recommended false
    // Pass it to unmute if the context exists... ie WebAudio is supported
    if (context) {
      // If you need to be able to disable unmute at a later time, you can use the returned handle's dispose() method
      // if you don't need to do that (most folks won't) then you can simply ignore the return value
      let unmuteHandle = unmute(context, allowBackgroundPlayback, forceIOSBehavior);

      // ... at some later point you wish to STOP unmute control
      // unmuteHandle.dispose();
      // unmuteHandle = null;

    }
  }
  updateTimer(newValue: number) {
    if (newValue <= 0 || !newValue)
      newValue = 4;
    this.timerSecondsBased = newValue;
    this.timerRefresh = newValue * 1000;
    this.mySubscription.unsubscribe();
    this.mySubscription = interval(this.timerRefresh).subscribe((x => {
      this.generateNotesRandomly();
    }));
  }

  generateNotesRandomly() {
    this.nameNote = '';
    this.typeNoteIntermediate = '';
    this.firstNoteId = -1;
    let firstNote = this.randomNoteFromGamme(this.gammeParameter);
    this.firstNoteId = firstNote;
    // console.log('first note', firstNote);
    const triadeNotesToPlay = this.triadesNotes(this.triadeTypeParameter, firstNote);
    this.displayNotesv2(triadeNotesToPlay);
  }

  randomNoteFromGamme(choice: string): number {
    let i = -1;
    if (choice === 'all') {
      if (this.triadeTypeParameter === 'all_intermediate')
        i = this.getRandomIntInclusive(3, 31); // 1T max de décalage entre chaque borne (+2 - 2)
      else
        i = this.getRandomIntInclusive(1, 33);
    }
    if (choice === 'do_majeur') {
      let randomIndex = -1;
      if (this.triadeTypeParameter === 'all_intermediate')
        randomIndex = this.getRandomIntInclusive(1, this.listGammeDoMajeur.length - 1); // 1T max de décalage entre chaque borne, ça dépend de l'id min/max de chaque gammes
      else
        randomIndex = this.getRandomIntInclusive(0, this.listGammeDoMajeur.length - 1);
      i = this.listGammeDoMajeur[randomIndex];
    }
    return i;
  }

  triadesNotes(choice: string, firstNote: number): number[] {
    let majOrMin: number = -1;
    let fourthNote = -1;
    let ideaToPickIntermediate = -1;
    let newFirstNote = -1;
    if (choice === 'all_basics') {
      majOrMin = this.getRandomIntInclusive(3, 4);
    }
    if (choice === 'min') {
      majOrMin = 3;
    }
    if (choice === 'maj') {
      majOrMin = 4;
    }
    if (choice === 'all_intermediate') {
      majOrMin = this.getRandomIntInclusive(3, 4);
      ideaToPickIntermediate = this.getRandomIntInclusive(1, 3);
      if (ideaToPickIntermediate === 1) { // 7ème
        this.typeNoteIntermediate = '7';
        if (majOrMin === 4) {
          fourthNote = firstNote - 1; // Do7. 1 demi-ton en dessous de la F.
        }
        if (majOrMin === 3) {
          fourthNote = firstNote - 2; // Dom7 1 ton en dessous de la F.
        }
      }
      if (ideaToPickIntermediate === 2) { // 9ème
        this.typeNoteIntermediate = '9';
        fourthNote = firstNote + 2; // Do(m)9. 1 ton au dessus de la F.
      }
      if (ideaToPickIntermediate === 3) { // rootless voicing
        this.typeNoteIntermediate = 'Rootless Voicing';
        if (majOrMin === 4) {
          fourthNote = firstNote - 1; // 1 demi-ton en dessous de la F.
        }
        if (majOrMin === 3) {
          fourthNote = firstNote - 2; // 1 ton en dessous de la F.
        }
        newFirstNote = firstNote + 2;
      }
    }
    const secondNote = firstNote + majOrMin; // tierce, +3 or +4
    let thirdNote = -1;
    if (majOrMin === 4) { // quinte
      thirdNote = secondNote + 3;
      this.typeExercice = 'majeur';
    }
    if (majOrMin === 3) { // quinte
      thirdNote = secondNote + 4;
      this.typeExercice = 'mineur';
    }
    if (newFirstNote !== -1) {// Rootless Voicing 
      firstNote = newFirstNote;
    }
    if (fourthNote !== -1) {
      return [firstNote, secondNote, thirdNote, fourthNote];
    }
    else {
      return [firstNote, secondNote, thirdNote];
    }
  }

  setupPiano() {
    const piano: any = document.getElementById("piano");
    const allNaturalNotes = this.getAllNaturalNotes(this.range);
    const pianoWidth = allNaturalNotes.length * this.whiteKeyWidth;

    const SVG = this.createMainSVG(pianoWidth, this.pianoHeight);

    // Add white keys
    let whiteKeyPositionX = 0;

    allNaturalNotes.forEach((noteName: any) => {
      const whiteKeyTextGroup = this.utils.createSVGElement("g");
      const whiteKey = this.createKey({ className: "white-key", width: this.whiteKeyWidth, height: this.pianoHeight });
      const text = this.utils.createSVGElement("text");

      this.utils.addTextContent(text, noteName);
      this.utils.setAttributes(whiteKeyTextGroup, { "width": this.whiteKeyWidth });
      this.utils.setAttributes(text, {
        "x": whiteKeyPositionX + this.whiteKeyWidth / 2,
        "y": 380,
        "text-anchor": "middle"
      });

      this.utils.setAttributes(whiteKey, {
        "x": whiteKeyPositionX,
        "data-note-name": noteName,
        "rx": "15",
        "ry": "15"
      });

      text.classList.add("white-key-text");
      whiteKeyTextGroup.appendChild(whiteKey);
      whiteKeyTextGroup.appendChild(text);
      SVG.appendChild(whiteKeyTextGroup);

      // Increment spacing between keys
      whiteKeyPositionX += this.whiteKeyWidth;
    });
    // Add black keys
    let blackKeyPositionX = 60;
    allNaturalNotes.forEach((naturalNote: any, index: any, array: any) => {
      // If last iteration of keys, do not add black key
      if (index === array.length - 1) {
        return;
      }

      const blackKeyTextGroup = this.utils.createSVGElement("g");
      const blackKey = this.createKey({ className: "black-key", width: this.whiteKeyWidth / 2, height: this.pianoHeight / 1.6 });
      const flatNameText = this.utils.createSVGElement("text");
      const sharpNameText = this.utils.createSVGElement("text");

      this.utils.setAttributes(blackKeyTextGroup, { "width": this.whiteKeyWidth / 2 });


      for (let i = 0; i < this.naturalNotesSharps.length; i++) {
        let naturalSharpNoteName = this.naturalNotesSharps[i];
        let naturalFlatNoteName = this.naturalNotesFlats[i];

        if (naturalSharpNoteName === naturalNote[0]) {

          this.utils.setAttributes(blackKey, {
            "x": blackKeyPositionX,
            "data-sharp-name": `${naturalSharpNoteName}#${naturalNote[1]}`,
            "data-flat-name": `${naturalFlatNoteName}b${naturalNote[1]}`,
            "rx": "8",
            "ry": "8"
          });

          this.utils.setAttributes(sharpNameText, {
            "text-anchor": "middle",
            'y': 215,
            "x": blackKeyPositionX + (this.whiteKeyWidth / 4)
          });

          this.utils.setAttributes(flatNameText, {
            "text-anchor": "middle",
            'y': 235,
            "x": blackKeyPositionX + (this.whiteKeyWidth / 4)
          });

          this.utils.addTextContent(sharpNameText, `${naturalSharpNoteName}♯`);
          this.utils.addTextContent(flatNameText, `${naturalFlatNoteName}♭`);

          flatNameText.classList.add("black-key-text");
          sharpNameText.classList.add("black-key-text");

          // Add double spacing between D# and A#
          if (naturalSharpNoteName === "D" || naturalSharpNoteName === "A") {
            blackKeyPositionX += this.whiteKeyWidth * 2;
          } else {
            blackKeyPositionX += this.whiteKeyWidth;
          }

          blackKeyTextGroup.appendChild(blackKey);
          blackKeyTextGroup.appendChild(flatNameText);
          blackKeyTextGroup.appendChild(sharpNameText);
        }

      }
      SVG.appendChild(blackKeyTextGroup);
    });
    // Add main SVG to piano div
    piano.appendChild(SVG);
    this.bindNotesIds();
  }

  createOctave(octaveNumber: any) {
    const octave = this.utils.createSVGElement("g");
    octave.classList.add("octave");
    const octaveWidth = 20;
    octave.setAttribute("transform", `translate(${octaveNumber * octaveWidth}, 0)`);
    return octave;
  }

  createKey(obj: any) {
    // { className, width, height }
    const key = this.utils.createSVGElement("rect");
    key.classList.add(obj.className, "key");
    this.utils.setAttributes(key, {
      "width": obj.width,
      "height": obj.height
    });
    return key;
  }

  getAllNaturalNotes(notes: any) {
    const firstNote = notes[0];
    const lastNote = notes[1];
    // Assign octave number, notes and positions to variables
    const firstNoteName = firstNote[0];
    const firstOctaveNumber = parseInt(firstNote[1]);

    const lastNoteName = lastNote[0];
    const lastOctaveNumber = parseInt(lastNote[1]);

    const firstNotePosition = this.naturalNotes.indexOf(firstNoteName);
    const lastNotePosition = this.naturalNotes.indexOf(lastNoteName);

    let allNaturalNotes: any = [];

    for (let octaveNumber = firstOctaveNumber; octaveNumber <= lastOctaveNumber; octaveNumber++) {
      // Handle first octave
      if (octaveNumber === firstOctaveNumber) {
        this.naturalNotes.slice(firstNotePosition).forEach((noteName) => {
          allNaturalNotes.push(noteName + octaveNumber);
        });

        // Handle last octave
      } else if (octaveNumber === lastOctaveNumber) {
        this.naturalNotes.slice(0, lastNotePosition + 1).forEach((noteName) => {
          allNaturalNotes.push(noteName + octaveNumber);
        });

      } else {
        this.naturalNotes.forEach((noteName) => {
          allNaturalNotes.push(noteName + octaveNumber);
        });
      }
    }
    return allNaturalNotes;
  }

  createMainSVG(pianoWidth: any, pianoHeight: any) {
    const svg = this.utils.createSVGElement("svg");

    this.utils.setAttributes(svg, {
      "width": "100%",
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      "viewBox": `0 0 ${pianoWidth} ${pianoHeight}`
    });

    return svg;
  }

  displayNotes(notes: number[]) {
    let pianoKeyNames: any = [];
    /*
    const naturalName = key.dataset.noteName;
    const sharpName = key.dataset.sharpName;
    const flatName = key.dataset.flatName;
    */
    notes.forEach((keyId: number) => {
      const keyAssociated: HTMLElement = (document.getElementsByClassName(`note${keyId}`)[0] as HTMLElement);
      keyAssociated.classList.add("show");
    });
  }

  bindNotesIds() {
    const pianoKeys = this.retrieveNotesAfterCleaning();
    pianoKeys.forEach((key: any) => { // rewrite code here
      let noteName = this.parseNoteName(key);
      const idNote = this.findIdByName(noteName);
      key.classList.add(`note${idNote}`);
      /*
      const currentNote = this.allNotes[i];
      const lengthNote = currentNote.length;
      const idNote = currentNote[lengthNote - 1]; // represent ID of my note
      i++
      */
    });
  }

  findIdByName(name: string): string {
    for (let note of this.allNotes) {
      if (note[0] === name)
        return note[note.length - 1]; // id of the note
    }
    return '-1';
  }
  retrieveNotesAfterCleaning() {
    let pianoKeys = document.querySelectorAll(".key");
    this.utils.removeClassFromNodeCollection(pianoKeys, "show");
    return pianoKeys;
  }

  listGammeDoMajeur = [1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25, 27, 29, 30, 32]; // max = 33;

  allNotes: string[][] = [
    ['C1', '1']
    , ['C#1', 'Db1', '2']
    , ['D1', '3']
    , ['D#1', 'Eb1', '4']
    , ['E1', '5']
    , ['F1', '6']
    , ['F#1', 'Gb1', '7']
    , ['G1', '8']
    , ['G#1', 'Ab1', '9']
    , ['A1', '10']
    , ['A#1', 'Bb1', '11']
    , ['B1', '12']
    , ['C2', '13']
    , ['C#2', 'Db2', '14']
    , ['D2', '15']
    , ['D#2', 'Eb2', '16']
    , ['E2', '17']
    , ['F2', '18']
    , ['F#2', 'Gb2', '19']
    , ['G2', '20']
    , ['G#2', 'Ab2', '21']
    , ['A2', '22']
    , ['A#2', 'Bb2', '23']
    , ['B2', '24']
    , ['C3', '25']
    , ['C#3', 'Db3', '26']
    , ['D3', '27']
    , ['D#3', 'Eb3', '28']
    , ['E3', '29']
    , ['F3', '30']
    , ['F#3', 'Gb3', '31']
    , ['G3', '32']
    , ['G#3', 'Ab3', '33']
    , ['A3', '34']
    , ['A#3', 'Bb3', '35']
    , ['B3', '36']
    , ['C4', '37']
    , ['C#4', 'Db4', '38']
    , ['D4', '39']
    , ['D#4', 'Eb4', '40']
    , ['E4', '41']
  ];

  parseNoteName(key: any): string {
    let noteName = '';
    if (key.dataset.noteName)
      noteName = key.dataset.noteName;
    else if (key.dataset.sharpName)
      noteName = key.dataset.sharpName;
    return noteName;
  }


  async displayNotesv2(idNotes: number[]) {
    this.retrieveNotesAfterCleaning();
    this.displayNotes(idNotes);
    let newList: string[] = [];
    for (let idNote of idNotes) { // change tone +2
      let key: any = document.getElementsByClassName(`note${idNote}`)[0];
      let noteName = this.parseNoteName(key);
      if (noteName.includes('1'))
        noteName = noteName.replace('1', '3');
      else if (noteName.includes('2'))
        noteName = noteName.replace('2', '4');
      else if (noteName.includes('3'))
        noteName = noteName.replace('3', '5');
      else if (noteName.includes('4'))
        noteName = noteName.replace('4', '6');
      newList.push(noteName);
    };
    // console.log('notes to play', newList);
    // console.log('notes ids', idNotes);
    this.setText();
    if (this.sound) {
      if (Tone.context.state !== 'running') {
        Tone.context.resume();
        await Tone.start();
        console.log('tone resumed ?', Tone.context.state);
      }
      this.pianoSong.triggerAttackRelease([...newList], 2.5);
    }
  }

  setText() {
    let firstKey: any = document.getElementsByClassName(`note${this.firstNoteId}`)[0];
    let diese = '';
    let noteName = this.parseNoteName(firstKey);
    if (noteName.includes('#')) // 
      diese = '#';
    this.nameNote = `${noteName.charAt(0)}${diese} (${this.translateToFrench(noteName.charAt(0))}${diese}) ${this.typeExercice} ${this.typeNoteIntermediate}`;
    if (diese.length) {
      const flatName = firstKey.dataset.flatName;
      this.nameNote += ` / ${flatName.charAt(0)}♭ (${this.translateToFrench(flatName.charAt(0))}♭) ${this.typeExercice} ${this.typeNoteIntermediate}`;
    }
  }

  translateToFrench(letter: string) {
    if (letter === 'C')
      return 'Do';
    if (letter === 'D')
      return 'Ré';
    if (letter === 'E')
      return 'Mi';
    if (letter === 'F')
      return 'Fa';
    if (letter === 'G')
      return 'Sol';
    if (letter === 'A')
      return 'La';
    if (letter === 'B')
      return 'Si';
    return '?';
  }

  getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateGammeParameter(value: string) {
    this.gammeParameter = value;
  }

  updateTriadeParameter(value: string) {
    this.triadeTypeParameter = value;
  }

}
