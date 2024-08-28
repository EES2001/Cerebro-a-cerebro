module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Nuevo usuario conectado');

        // Eventos de ejemplo
        socket.on('joinRoom', ({ roomCode }) => {
            socket.join(roomCode);
            console.log(`Usuario se unió a la sala ${roomCode}`);
        });

        socket.on('selectTeam', ({ team }) => {
            // Lógica para manejar la selección de equipo
        });

        // Más lógica de eventos aquí...

        socket.on('disconnect', () => {
            console.log('Usuario desconectado');
        });
    });
};
