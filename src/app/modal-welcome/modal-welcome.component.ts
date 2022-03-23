import { Component } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Exercice } from '../music.model';

/**
 * @title Dialog with header, scrollable content and actions
 */
@Component({
    selector: 'modal-welcome.component',
    templateUrl: './modal-welcome.component.html',
    styleUrls: ['./modal-welcome.component.scss'],
})
export class ModalWelcomeDialog {

    pseudo = 'Pianiste';
    idExercice = 0;
    exercice: Exercice = {
        gammeParameter: '',
        triadeTypeParameter: '',
        progressionAccordsParam: '',
        timer: 15,
        showTriadesParam: true,
        showProgressionAccordParam: false,
        showBlog: true,
        showGammeParam: true,
        info: ''
    }
    constructor(
        public dialogRef: MatDialogRef<ModalWelcomeDialog>,
        private route: ActivatedRoute
    ) {
        this.route.queryParams.subscribe(params => {
            if (params['idExercice']) {
                this.idExercice = params['idExercice'];
                this.setExercice(this.idExercice);
                this.close();
            }
        });
    }

    setExercice(i: number) {
        this.idExercice = +i;
        if (this.idExercice === 1) { // triades simples
            this.exercice.gammeParameter = 'all'; // all domaj_accord7 remin_accord7 domaj_accord_classique remin_accord_classique
            this.exercice.triadeTypeParameter = 'all_basics'; //all_basics all_intermediate min maj
            this.exercice.progressionAccordsParam = 'all'; // all 1.4.5.4
        }
        if (this.idExercice === 2) { // triades 7 9 Rootless voicing
            this.exercice.gammeParameter = 'all'; // all domaj_accord7 remin_accord7 domaj_accord_classique remin_accord_classique
            this.exercice.triadeTypeParameter = 'all_intermediate'; //all_basics all_intermediate min maj
            this.exercice.progressionAccordsParam = 'all'; // all 1.4.5.4
            this.exercice.info = '7ème 9ème & Rootless voicing';
        }
        if (this.idExercice === 3) { // Progression Accords Ré Mineur Accord 7
            this.exercice.gammeParameter = 'remin_accord7'; // all domaj_accord7 remin_accord7 domaj_accord_classique remin_accord_classique
            this.exercice.triadeTypeParameter = 'all_basics'; //all_basics all_intermediate min maj
            this.exercice.progressionAccordsParam = '1.4.5.4'; // all 1.4.5.4
            this.exercice.showTriadesParam = false;
            this.exercice.showBlog = false;
            this.exercice.showGammeParam = false;
            this.exercice.info = 'Progression Accords I - IV - V - IV | Ré Mineur (Accords 7)';
        }
        if (this.idExercice === 4) { // Progression Accords Do Maj Accord 7
            this.exercice.gammeParameter = 'domaj_accord7'; // all domaj_accord7 remin_accord7 domaj_accord_classique remin_accord_classique
            this.exercice.triadeTypeParameter = 'all_basics'; //all_basics all_intermediate min maj
            this.exercice.progressionAccordsParam = '1.4.5.4'; // all 1.4.5.4
            this.exercice.showTriadesParam = false;
            this.exercice.showBlog = false;
            this.exercice.showGammeParam = false;
            this.exercice.info = 'Progression Accords I - IV - V - IV | Do Majeur (Accords 7)';
        }
        if (this.idExercice === 5) { // Progression Accords Ré Mineur Accord Mineur
            this.exercice.gammeParameter = 'remin_accord_classique'; // all domaj_accord7 remin_accord7 domaj_accord_classique remin_accord_classique
            this.exercice.triadeTypeParameter = 'all_basics'; //all_basics all_intermediate min maj
            this.exercice.progressionAccordsParam = '1.4.5.4'; // all 1.4.5.4
            this.exercice.showTriadesParam = false;
            this.exercice.showBlog = false;
            this.exercice.showGammeParam = false;
            this.exercice.info = 'Progression Accords I - IV - V - IV | Ré Mineur (Accords Mineur)';
        }
        if (this.idExercice === 6) { // Progression Accords Do Maj Accord Majeur
            this.exercice.gammeParameter = 'domaj_accord_classique'; // all domaj_accord7 remin_accord7 domaj_accord_classique remin_accord_classique
            this.exercice.triadeTypeParameter = 'all'; //all_basics all_intermediate min maj
            this.exercice.progressionAccordsParam = '1.4.5.4'; // all 1.4.5.4
            this.exercice.showTriadesParam = false;
            this.exercice.showBlog = false;
            this.exercice.showGammeParam = false;
            this.exercice.info = 'Progression Accords I - IV - V - IV | Do Majeur (Accords Majeur)';
        }
    }
    close() {
        if (this.exercice.timer < 3)
            this.exercice.timer = 15;
        if (this.exercice.timer > 60)
            this.exercice.timer = 59;
        if (this.idExercice !== 0)
            this.dialogRef.close(this.exercice);
        else
            this.showError = true;
    }
    showError = false;
}