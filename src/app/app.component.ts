import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { interval, Subscription } from 'rxjs';
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
  timerRefresh = 2000;
  naturalNotes = ["C", "D", "E", "F", "G", "A", "B"];
  naturalNotesSharps: string[] = ["C", "D", "F", "G", "A"];
  naturalNotesFlats = ["D", "E", "G", "A", "B"];
  nameNote = '';
  range = ["C1", "B5"];
  mySubscription: any;


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
    removeClassFromNodeCollection(nodeCollection: any, classToRemove: any) {
      nodeCollection.forEach((node: any) => {
        if (node.classList.contains(classToRemove)) {
          node.classList.remove(classToRemove);
        }
      });
    }
  }

  ngAfterViewInit() {
    this.setupPiano();
    this.generateNotesRandomly();
    this.mySubscription = interval(this.timerRefresh).subscribe((x => {
      this.generateNotesRandomly();
    }));
  }

  constructor() {

  }

  updateTimer(newValue: number) {
    this.timerRefresh = newValue;
    this.mySubscription.unsubscribe();
    this.mySubscription = interval(this.timerRefresh).subscribe((x => {
      this.generateNotesRandomly();
    }));
  }
  generateNotesRandomly() {
    const i = this.getRandomIntInclusive(1, 53);
    const majOrMin = this.getRandomIntInclusive(3, 4);
    this.nameNote = '';
    const i2 = i + majOrMin; // +3 or +4
    let typeExercice = '';
    let i3 = 1;
    if (majOrMin === 4) {
      i3 = i2 + 3;
      typeExercice = 'mineur';
    }
    if (majOrMin === 3) {
      i3 = i2 + 4;
      typeExercice = 'majeur';
    }
    this.displayNotesv2([i, i2, i3], typeExercice);
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

  displayNotes(notes: string[]) {
    const pianoKeys = this.retrieveNotesAfterCleaning();
    pianoKeys
    notes.forEach((noteName: any) => {
      pianoKeys.forEach((key: any) => {
        const naturalName = key.dataset.noteName;
        const sharpName = key.dataset.sharpName;
        const flatName = key.dataset.flatName;
        if (naturalName === noteName || sharpName === noteName || flatName === noteName) {
          key.classList.add("show");
        }
      });
    });
  }

  retrieveNotesAfterCleaning() {
    let pianoKeys = document.querySelectorAll(".key");
    this.utils.removeClassFromNodeCollection(pianoKeys, "show");
    return pianoKeys;
  }

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
    , ['F4', '42']
    , ['F#4', 'Gb4', '43']
    , ['G4', '44']
    , ['G#4', 'Ab4', '45']
    , ['A4', '46']
    , ['A#4', 'Bb4', '47']
    , ['B4', '48']
    , ['C5', '49']
    , ['C#5', 'Db5', '50']
    , ['D5', '51']
    , ['D#5', 'Eb5', '52']
    , ['E5', '53']
    , ['F5', '54']
    , ['F#5', 'Gb5', '55']
    , ['G5', '56']
    , ['G#5', 'Ab5', '57']
    , ['A5', '58']
    , ['A#5', 'Bb5', '59']
    , ['B5', '60']
    , ['C6', '61']
  ];

  displayNotesv2(notes: number[], type: string) {
    const list: string[] = [];
    notes.forEach((index: number) => {
      list.push(this.allNotes[index - 1][0]);
    });
    const baseNoteIndex = notes[0];
    const baseNoteName = this.allNotes[baseNoteIndex - 1][0];
    this.nameNote = `${baseNoteName.charAt(0)} ${type}`;
    this.displayNotes(list);
  }

  getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
