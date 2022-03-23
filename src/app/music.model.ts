export interface TonalHarmonies {
    accord_classique: string,
    accord7: string,
    noteFr: string
}

export interface Exercice {
    gammeParameter: string;
    triadeTypeParameter: string;
    progressionAccordsParam: string;
    timer: number;
    showTriadesParam: boolean;
    showProgressionAccordParam: boolean;
    showBlog: boolean;
    showGammeParam: boolean;
    info: string;
}