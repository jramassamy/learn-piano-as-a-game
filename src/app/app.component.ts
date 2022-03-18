import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import * as Tone from 'tone';
const StartAudioContext = require('startaudiocontext');

const unmuteAudio = require('unmute-ios-audio');

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
  triadeTypeParameter: string = 'all'; // 'min' | 'maj' | 'all'
  typeExercice: string = '';
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
    this.setupPiano();
    this.initPianoSong();
    this.test();
    this.mySubscription = interval(this.timerRefresh).subscribe((x => {
      this.generateNotesRandomly();
    }));
  }

  touch($event: any) {

  }

  initPianoSong() {
  }

  constructor() {
  }

  async soundAuthorized() {
    this.sound = !this.sound;
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
    window.addEventListener('touchstart', () => {
      var AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      var context = new AudioContext();
      // create empty buffer
      var buffer = context.createBuffer(1, 1, 22050);
      var source = context.createBufferSource();
      source.buffer = buffer;

      // connect to output (your speakers)
      source.connect(context.destination);

      // play the file
      source.start ? source.start(0) : (source as any).noteOn(0);
      console.log('do a weird trick');
    }, false);
  }
  updateTimer(newValue: number) {
    this.timerSecondsBased = newValue;
    this.timerRefresh = newValue * 1000;
    this.mySubscription.unsubscribe();
    this.mySubscription = interval(this.timerRefresh).subscribe((x => {
      this.generateNotesRandomly();
    }));
  }

  generateNotesRandomly() {
    let firstNote = this.randomNoteFromGamme(this.gammeParameter)
    const triadeNotesToPlay = this.triadesNotes(this.triadeTypeParameter, firstNote);
    this.displayNotesv2(triadeNotesToPlay);
  }

  randomNoteFromGamme(choice: string): number {
    let i = -1;
    if (choice === 'all') {
      i = this.getRandomIntInclusive(1, 33);
    }
    if (choice === 'do_majeur') {
      const randomIndex = this.getRandomIntInclusive(0, this.listGammeDoMajeur.length - 1);
      i = this.listGammeDoMajeur[randomIndex];
    }
    return i;
  }

  triadesNotes(choice: string, firstNote: number): number[] {
    let majOrMin: number = -1;
    if (choice === 'all') {
      majOrMin = this.getRandomIntInclusive(3, 4);
    }
    if (choice === 'min') {
      majOrMin = 3;
    }
    if (choice === 'maj') {
      majOrMin = 4;
    }
    this.nameNote = '';
    const secondNote = firstNote + majOrMin; // +3 or +4
    let thirdNote = 1;
    if (majOrMin === 4) {
      thirdNote = secondNote + 3;
      this.typeExercice = 'majeur';
    }
    if (majOrMin === 3) {
      thirdNote = secondNote + 4;
      this.typeExercice = 'mineur';
    }
    return [firstNote, secondNote, thirdNote];
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
      pianoKeyNames.push(keyAssociated);
      keyAssociated.classList.add("show");
    });
    const fundamentalNote = notes[0];
    this.setText(fundamentalNote);
  }

  bindNotesIds() {
    const pianoKeys = this.retrieveNotesAfterCleaning();
    let i = 0;
    this.allNotes.forEach((note) => {

    });
    pianoKeys.forEach((key: any) => { // rewrite code here
      let nameKey = '';
      if (key.dataset.noteName)
        nameKey = key.dataset.noteName;
      else if (key.dataset.sharpName)
        nameKey = key.dataset.sharpName;
      const idNote = this.findIdByName(nameKey);
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

  async displayNotesv2(idNotes: number[]) {
    this.retrieveNotesAfterCleaning();
    this.displayNotes(idNotes);
    let newList: string[] = [];
    for (let idNote of idNotes) { // change tone +2
      let noteName = this.allNotes[idNote][0];
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
    if (this.sound) {
      if (Tone.context.state !== 'running') {
        Tone.context.resume();
        await Tone.start();
        console.log('tone resumed ?', Tone.context.state);
      }
      this.pianoSong.triggerAttackRelease([...newList], 2.5);
    }
  }

  setText(noteKey: number) {
    const note = this.allNotes[noteKey];
    let diese = '';
    if (note[0].includes('#')) // 
      diese = '#';
    this.nameNote = `${note[0].charAt(0)}${diese} (${this.translateToFrench(note[0].charAt(0))}${diese}) ${this.typeExercice}`;
    if (diese) {
      this.nameNote += ` / ${note[1].charAt(0)}♭ (${this.translateToFrench(note[1].charAt(0))}♭) ${this.typeExercice}`;
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
