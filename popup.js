document.addEventListener('DOMContentLoaded', () => {
  const speakButton = document.getElementById('speak-button');
  const voiceSelect = document.getElementById('voice');
  const rateInput = document.getElementById('rate');
  const rateValue = document.getElementById('rate-value');
  const pitchInput = document.getElementById('pitch');
  const pitchValue = document.getElementById('pitch-value');
  const volumeInput = document.getElementById('volume');
  const volumeValue = document.getElementById('volume-value');
  const textInput = document.getElementById('text');

  const synth = window.speechSynthesis;
  let voices = [];
  let currentUtterance = null;
  let currentText = '';
  let currentIndex = 0;

  function populateVoiceList() {
      voices = synth.getVoices();
      voiceSelect.innerHTML = '';
      voices.forEach(voice => {
          const option = document.createElement('option');
          option.textContent = `${voice.name} (${voice.lang})`;
          if (voice.default) {
              option.textContent += ' [default]';
          }
          option.setAttribute('data-lang', voice.lang);
          option.setAttribute('data-name', voice.name);
          voiceSelect.appendChild(option);
      });
  }

  function speak(text, startIndex = 0) {
      if (synth.speaking) {
          synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text.slice(startIndex));
      const selectedVoiceName = voiceSelect.selectedOptions[0].getAttribute('data-name');
      utterance.voice = voices.find(voice => voice.name === selectedVoiceName);
      utterance.rate = parseFloat(rateInput.value);
      utterance.pitch = parseFloat(pitchInput.value);
      utterance.volume = parseFloat(volumeInput.value);

      utterance.onend = () => {
          currentIndex = text.length; // All text has been read
      };

      utterance.onboundary = (event) => {
          if (event.name === 'word') {
              currentIndex = startIndex + event.charIndex;
          }
      };

      currentUtterance = utterance;
      synth.speak(utterance);
  }

  function updateSpeakingUtterance() {
      if (currentUtterance && synth.speaking) {
          const remainingText = currentText.slice(currentIndex);
          speak(remainingText);
      }
  }

  populateVoiceList();
  if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoiceList;
  }

  rateInput.addEventListener('input', () => {
      rateValue.textContent = rateInput.value;
      updateSpeakingUtterance();
  });

  pitchInput.addEventListener('input', () => {
      pitchValue.textContent = pitchInput.value;
      updateSpeakingUtterance();
  });

  volumeInput.addEventListener('input', () => {
      volumeValue.textContent = volumeInput.value;
      updateSpeakingUtterance();
  });

  speakButton.addEventListener('click', () => {
      currentText = textInput.value || 'No text provided';
      currentIndex = 0;
      speak(currentText);
  });

  chrome.storage.sync.get('selectedText', data => {
      if (data.selectedText) {
          textInput.value = data.selectedText;
          currentText = data.selectedText;
          currentIndex = 0;
          speak(data.selectedText);
          chrome.storage.sync.remove('selectedText'); // Clear the storage after using the text
      }
  });
});
