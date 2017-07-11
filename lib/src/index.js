import {debug, sequence, errBreak, buildDOM, searchDOM} from 'pomace-base';
import {toStringNode, toHtmlElement, toParamsVal, insertComponents, camelToMiddleLine} from './process';

const __state__ = {};

class Page {

  constructor(name){
    this.name = name;
    this.face = null;
    this.renderTimes = 0;
    this.components = [];
    this.theme = {};
    this.process = {};
    this.preprocess = {};
    this.dothProcess = [];
    this.__style__ = null;
    this.__cap__ = null;
    this.__err__ = null;
    this.__mess__ = {};
    this.__state__ = {};
    this.__on__ = {};
    this.__call__ = {fetch(){},cram(){}};
  }

  definePreprocess(preprocess = {}){
    this.preprocess = preprocess;
  }

  setup(doth){
    doth({
      face: (tags='')=>{
        this.face = tags;
      },
      theme: (style={})=>{
        this.theme = style;
      },
      components: (components=[])=>{
        this.components = components;
      },
      connect: (reset={})=>{
        this.__call__.fetch = reset.fetch? reset.fetch:()=>{};
        this.__call__.cram  = reset.cram? reset.cram:()=>{};
      },
    });
  }

  capture(cb){
    this.__cap__ = (errType)=>{
      cb && cb({
        type: errType,
        msg: this.__mess__[errType],
      });
    };
  }

  message(type,content){
    this.__mess__[type] = content;
  }

  render(){
    const s = this;

    sequence(s.dothProcess).begin({
      fetch(){
        return s.fetch.apply(s,arguments);
      },
      cram(){
        s.cram.apply(s,arguments);
      },
      dispatch(){
        s.__dispatch__.apply(s,arguments);
      },
      error(type){
        this.__cap__(type);
      },
      get RENDER_TIMES(){
        return s.renderTimes;
      }
    });
  }

  fetch(k){
    const ic = this.__call__;
    const is = this.__state__;

    return typeof is[k] !== 'undefined'? is[k]:ic.fetch(k);
  }

  cram(k,v){
    const ic = this.__call__;
    const is = this.__state__;

    ic.cram? ic.cram(k,v):null;

    is[k] = v;

    Page.store.cram(`${this.name}_${k}`,v);
  }

  on(n,doth){
    const on = this.__on__;

    if(typeof doth === 'function'){
      on[n] = doth;
    }else if(on.hasOwnProperty(n) && typeof on[n] === 'function'){
      on[n](doth);
    }else{
      errBreak(`Not defined ${n} event by the page.`);
    }
  }

  get flow(){
   return {
     process: (pn,doth) => {
       if(typeof doth !== 'function'){
         errBreak(`${pn}'s doth must a function`);
         return;
       }
       if(this.process.hasOwnProperty(pn)){
         errBreak(`Please rename your flow, ${pn} is defined.`);
         return;
       }

       const s = this;
       s.process[pn] = doth;

       s.dothProcess.push({
         key: pn,
         doth: !s.preprocess.hasOwnProperty(pn) && typeof s.preprocess[pn] !== 'function'?
           s.process[pn] : function(){
            s.preprocess[pn](()=>{
               s.process[pn].apply(s,arguments);
            },s);
          },
       });
     },
   };
  }

  __theme__(){
    const theme = {};
    let css = '';

    if(typeof this.theme === 'object'){
      for(const k in this.theme){
        if(!this.theme.hasOwnProperty(k) || typeof this.theme[k] !== 'object'){
          continue;
        }

        const thm = this.theme[k];
        const ithm = {};

        for(const z in thm){
          ithm[camelToMiddleLine(z)] = thm[z];
        }

        theme[camelToMiddleLine(k)] = ithm;
      }

      for(const j in theme){
        css += `${j} ${JSON.stringify(theme[j],null,'\t').replace(/"/g,'').replace(/\,/g,';')}`;
      }
    }

    return css;
  }

  __dispatch__(){
    debug(`[page] ${this.name} (render ${++this.renderTimes} times)`);

    const faceType = typeof arguments[0] === 'string'? arguments[0]:null;
    const params = typeof arguments[0] === 'object'? arguments[0]:(!arguments[1]?{}:arguments[1]);

    const {name, components} = this;
    const _css_ = this.__theme__();
    let {face} = this;

    if(typeof face === 'object'){
      face = face.hasOwnProperty(faceType)? face[faceType]:face['default'];
    }

    const header = buildDOM(document.head);
    let view = buildDOM(Page.view);
    let scope = buildDOM(document.body);
    let rendered = toStringNode(face, Object.keys(components));

    if(!this.__style__){
      const style = buildDOM('<style>');

      style.$$.html(`\n${_css_}\n`);
      header.$$.last(style);
      this.__style__ = style;
    }

    rendered = toParamsVal(params, rendered);
    rendered = toHtmlElement(name, rendered);
    insertComponents(rendered.children, components);
    view.$$.html('');
    view.$$.last(rendered.parent);

    if(view.$$.parent.tagName !== 'body'){
       scope.$$.last(view);
    }

    view = null;
    scope = null;
    rendered.parent = null;
    rendered.children = null;
    rendered = null;
  }


  static PREVIEW_OFF(){
    let preview = document.getElementById('pomace-preview');

    if(preview === null){
      return;
    }

    preview.style.display = 'none';
    preview = null;
  }

  static PREVIEW_ON(){
    let preview = document.getElementById('pomace-preview');

    if(preview === null){
      return;
    }

    preview.style.display = 'block';
    preview = null;
  }

  static get view(){
    let v = searchDOM('#pomace-view');

    v = v === null? buildDOM('<div id="pomace-view">'):v;

    return v;
  }

  static get store(){
    return {
      cram(k,v,n){
        __state__[`${typeof n !== 'undefined'?`${n}_`:''}${k}`] = v;
      },
      fetch(k,n){
        return __state__[`${typeof n !== 'undefined'?`${n}_`:''}${k}`];
      },
    };
  }
}

export default Page;
