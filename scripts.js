import { GoogleGenerativeAI } from "@google/generative-ai";

document.addEventListener('DOMContentLoaded', function() {

  // Default API keys for each support type
  const apiKeys = {
    emotional: "AIzaSyCMh1RlMFSKLWUNGkKT1XdcRqNQgv8M9RE",
    teaching: "AIzaSyCMh1RlMFSKLWUNGkKT1XdcRqNQgv8M9RE",
    healthcare: "AIzaSyA81Y-SeNjO4euqcDO9Nb49hBaNR1xiq5I",
  };

  let selectedApiKey = apiKeys.emotional;  // Default API key
  let spkr = "";

  // Function to set API key based on button click
  window.setApiKey = function(type) {
    selectedApiKey = apiKeys[type];
    console.log("API Key set for " + type + ": " + selectedApiKey);
    runModel("Hello! You are now connected for " + type + " support.");
  };

  // Get 'name' parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const nameParam = urlParams.get('name') || "User"; 
  console.log('Name from URL:', nameParam);

  async function startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      document.getElementById('webcam').srcObject = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }

  startWebcam();

  const video = document.getElementById("myVideo");
  const videoSource = document.getElementById("videoSource");
  const cutbtn = document.getElementById("cutcbtn");
  const utterance = new SpeechSynthesisUtterance();
  utterance.lang = 'en-US';
  utterance.rate = 1;

  cutbtn.onclick = () => {
    speechSynthesis.cancel();
    video.pause();
    video.currentTime = 0;
    video.style.display = "none";
    window.location.href="Close.html";
  };

  // Detect device width and set the video source accordingly
  function setVideoSource() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      videoSource.src = "cindrella.mp4"; 
      spkr="cindrella";
    } else {
      videoSource.src = "Man.mp4"; 
      spkr="John";
    }
    video.load();
  }

  setVideoSource();

  function submitted(inp) {
    const message = inp;
    runModel(message);
  }

  window.onload = runModel("Hi " + nameParam + "! Welcome to the app");

  async function runModel(prompt) {
    try {
      const genAI = new GoogleGenerativeAI(selectedApiKey);
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt + " (answer with a short message, don't use emojis, and remember your name is " + spkr + " and my name is " + nameParam + ")");
      const response = result.response.text();
      console.log(response);
      speak(response);
    } catch (error) {
      console.error('Error generating content:', error);
    }
  }

  function speak(inputText = "") {
    utterance.text = inputText;

    utterance.onstart = function() {
      video.currentTime = 0;
      video.play();
      video.loop = true;
    };

    utterance.onend = function() {
      video.pause();
      video.currentTime = 0;
      startListening();
    };

    speechSynthesis.speak(utterance);

    const spokenTextArea = document.getElementById("spoken-text");
    spokenTextArea.value += inputText + "\n";
  }

  document.getElementById("listenn").onclick = function() {
    startListening();
  };

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      submitted(transcript);
    };

    recognition.onerror = function(event) {
      console.error("Speech recognition error detected: " + event.error);
    };

    recognition.onend = function() {
      document.getElementById("micc").style.backgroundColor = "white";
    };

    recognition.start();
  }

});
