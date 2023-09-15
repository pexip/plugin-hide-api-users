let participants: Array<any> = [];

const load = () => {
  
  (window as any).PEX.actions$.ofType('[Conference] Connect Success').subscribe( (action: any) => {

    const pexrtc = (window as any).PEX.pexrtc; 

    // Override onParticipantCreate
    const onParticipantCreate = pexrtc.onParticipantCreate;
    pexrtc.onParticipantCreate = (participant: any) => {
      if (participant.protocol !== 'api') onParticipantCreate(participant);
    }

    // Override onParticipantUpdate
    const onParticipantUpdate = pexrtc.onParticipantUpdate;
    pexrtc.onParticipantUpdate = (participant: any) => {
      if (participant.protocol !== 'api') onParticipantUpdate(participant);
    }
    
  });
  
};


(window as any).PEX.pluginAPI.registerPlugin({
  id: 'hide-api-users',
  load: load,
  unload: () => console.log('Hide API Users Plugin', 'Unloaded')
});