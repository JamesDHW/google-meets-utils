import { io } from 'socket.io-client';

window.addEventListener('load', () => {
  const room_id = window.location.pathname.split('/')[1];

  const socket = io('http://localhost:3000', {
    withCredentials: true,
    query: { room_id },
  });

  socket.on('end-call', () => {
    const leaveCallButton = document.querySelector(
      '[aria-label="Leave call"]',
    ) as HTMLButtonElement;
    console.log({ leaveCallButton });
    leaveCallButton?.click();
  });

  const mountButton = () => {
    const leaveCallButton = document.querySelector('[aria-label="Leave call"]');
    const controlPanel = leaveCallButton?.parentNode?.parentNode;

    if (!controlPanel) return;

    if (document.getElementById('custom-button')) return;

    const button = document.createElement('button');
    button.id = 'custom-button';
    button.textContent = 'Mark as Ended';
    button.setAttribute('aria-label', 'Send Info');

    button.style.backgroundColor = 'rgb(234, 67, 53)';
    button.style.color = 'white';
    button.style.padding = '1rem .75rem';
    button.style.borderRadius = '100px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    button.style.marginLeft = '10px';

    button.addEventListener('click', sendRoomData);

    controlPanel.appendChild(button);
  };

  const sendRoomData = () => {
    socket.emit('event', {
      service_name: 'EndCallService',
      action: 'signal-end-call',
      data: { room_id },
    });
  };

  mountButton();
  setInterval(mountButton, 5000);
});
