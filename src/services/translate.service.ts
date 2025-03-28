import {TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams} from "@ngx-translate/core";

import * as translationEn from 'src/assets/i18n/en.json';
import * as translationEs from 'src/assets/i18n/es.json';

export class TranslateUniversalLoader implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    const currentLang =  params.translateService.currentLang;
    switch (currentLang){
      case 'en': return translationEn[params.key];
      case 'es': return translationEs[params.key];
      default  : return translationEn[params.key];
    }
  }
}
