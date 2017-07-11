import {debug, sequence, errBreak, buildDOM, gartherDOM} from 'pomace-base';

const obj = {};

const tag = {
   close(f){
     return new RegExp(`{#${f}/}`);
   },
   start(f){
     return new RegExp(`{#${f}}`);
   },
   end(f){
     return new RegExp(`{#\\/${f}}`);
   },
   normal(f){
     return new RegExp(`(\\{#${f}*?\\}(.|\\n)*?\\{#\\/${f}*?\\})+`);
   },
};

const noChild = (str,f) => {
  const nodeFormat = `
     <CHORUS_NODE_${String(f).toUpperCase()} class="__chrousNode__" fieldName="${f}">
     </CHORUS_NODE_${String(f).toUpperCase()}>
    `;
  return str.replace(tag.close(f),nodeFormat);
};

const hasChild = (str,f)=>{
  return str.replace(tag.normal(f),(str) => {
    const nodeStartFormat = `<CHORUS_NODE_${String(f).toUpperCase()} class="__chrousNode__" fieldName="${f}">`;
    const nodeEndFormat = `</CHORUS_NODE_${String(f).toUpperCase()}>`;

    str = str.replace(tag.start(f),nodeStartFormat);
    str = str.replace(tag.end(f),nodeEndFormat);

    return str;
  });
};

export const toStringNode = obj.toStringNode = (str,keys) => {
  for(let i=0;i<keys.length;i++){
    str = noChild(str,keys[i]);
    str = hasChild(str,keys[i]);
  }

  str = str.replace(tag.normal('[a-zA-Z0-9_]'),'');
  str = str.replace(tag.close('[a-zA-Z0-9_]'),'');

  return str;
};

export const toParamsVal = obj.toParamsVal = (params,str) => {
  for(const k in params){
    str = str.replace(new RegExp(`\\{\\$${k}\\}`,'g'),params[k]);
  }
  return str;
};

export const camelToMiddleLine  = obj.camelToMiddleLine = (str)=>{
   const newStr = [];

   for(let i=0;i<str.length;i++){
     const letter = str.charAt(i);

     if(/[A-Z]/g.test(letter)){
       newStr[i] = `-${letter.toLowerCase()}`;
     }else{
       newStr[i] = letter;
     }
   }

   return newStr.join('');
};

export const toHtmlElement = obj.toHtmlElement = (name,str) => {
   let node = null;

   if(/(<.+>(.|\n)+<\.+>)*?/g.test(str)){
     const builder = buildDOM('<div>');
     const arr = str.match(/<(.|\n)+>/g);

     str = arr !== null? arr.join(''):'';
     builder.$$.html(str);
     node = gartherDOM(builder.$$.child);
   }else{
     return '';
   }

   if(node === null){
     throw `Page ${name} create this face is fail.`;
   }

   const chorusNodes = node.$$.searchAll('.__chrousNode__');
   const fields = {};

   chorusNodes.map(cn=>{
     const fieldName = cn.getAttribute('fieldName');
     fields[fieldName] = cn;
   });

   return {
     parent: node,
     children: fields,
   };
};

export const insertComponents = (fields,components) => {
   for(const fieldName in fields){
     let markNode = buildDOM(fields[fieldName]);
     let node = components[fieldName];

     markNode.$$.sibling(node);
     node.$$.last(markNode.$$.child);
     markNode.$$.remove();

     markNode = null;
     node = null;
   }
};

export default obj;
