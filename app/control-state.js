export function createControls({settings,sendNative,changed,persist}){
 const validLight=v=>['blue','moon','day'].includes(v);
 return {
  pause(value){if(sendNative){sendNative({type:'pause',value:Boolean(value)});return;}settings.paused=Boolean(value);persist();changed();},
  receivePause(value){settings.paused=Boolean(value);changed();},
  light(value){if(!validLight(value))return;if(sendNative){sendNative({type:'light',value});return;}settings.light=value;persist();changed();},
  receiveLight(value){if(validLight(value)){settings.light=value;changed();}}
 };
}
