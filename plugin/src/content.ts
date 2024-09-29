import { io } from 'socket.io-client';

window.addEventListener('load', () => {
  console.log('Content script loaded');

  const socket = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');

    const roomId = window.location.pathname.split('/')[1];

    socket.emit('event', {
      service_name: 'EndCallService',
      action: 'end-call',
      data: { roomId },
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  socket.on('end-call', (response: any) => {
    console.log('Received response:', response);
  });

  const mountButton = () => {
    const leaveCallButton = document.querySelector('[aria-label="Leave call"]');
    const controlPanel = leaveCallButton?.parentNode?.parentNode;

    if (!controlPanel) return;

    if (document.getElementById('custom-button')) return;

    const button = document.createElement('button');
    button.id = 'custom-button';
    button.textContent = 'Send Info';
    button.setAttribute('aria-label', 'Send Info');

    button.style.backgroundColor = 'rgb(234, 67, 53)';
    button.style.color = 'white';
    button.style.padding = '.5rem .75rem';
    button.style.borderRadius = '100px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    button.style.marginLeft = '10px';

    button.addEventListener('click', sendRoomData);

    controlPanel.appendChild(button);
  };

  const sendRoomData = () => {};

  mountButton();
  setInterval(mountButton, 5000);
});
