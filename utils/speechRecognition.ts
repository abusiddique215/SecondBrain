export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();

    // Convert Blob to audio element and play it
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();

    audio.onended = () => {
      recognition.stop();
    };
  });
};
