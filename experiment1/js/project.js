// project.js - purpose and description here
// Author: Sunny Han
// Date:

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
  }
}

function main() {
  const fillers = {
    verb: [
      "screamed at",
      "heard",
      "cried at",
      "walked towards",
      "looked down on",
      "started to run from",
      "started laughing at",
      "punched",
      "jumped away from",
      "sniffed",
      "talked to",
      "wanted to run from",
      "drove over",
      "ate",
      "started farting at",
      "offered ",
      "sang karaoke with",
      "tried to kiss",
      "painted ",
      "accidentally married",
      "threw up"
    ],
    object: [
      "fridge",
      "sandwich",
      "french fries",
      "speed limit",
      "door",
      "whispers",
      "latte",
      "picture",
      "dark door",
      "piano",
      "girlfriend",
      "boyfriend",
      "reflection",
      "dinosaur",
      "freshly ground beef",
      "toilet",
      "creature",
      "worm",
      "farts",
      "dinner",
      "banana",
      "shoes",
      "knife",
      "handheld grenade",
      "vodka bottle",
    ],
    monster: [
      "the dark door",
      "the police",
      "the creature",
      "the knife man",
      "my dad",
      "my mom",
      "the murderer",
      "the baddies",
      "the cannibal",
      "the patient",
      "the danger",
      "the John",
      "the creature",
      "the murderer man",
      "the Man",
      "the creature",
      "the Shadow",
      "Wes Modes",
      "the piss stealer",
      "the worm",
      "the Meat Worm",
      "Vegetable Worm",
      "the infinite void",
    ],
    action: [
      "danced violently",
      "farted in my face",
      "stared back",
      "disappeared",
      "started levitating",
      "gave me a $object",
      "proctored my exam",
      "shat violently",
      "screamed in my face",
      "roller bladed away",
      "ate my $object",
      "stabbed my friend",
      "ate my $object in front of me",
      "fed the worm",
      "kissed the creature",
      "started livestreaming",
      "sued me for emotional damage",
      "threw up a $object",
      "looked at the $object",
      "touched my $object",
      "whispered 'no thoughts, head empty'",
      "started singing skibidi toilet",
      "murdered me",
      "attacked the person next to me",
      "attacked my $object",
      "cyberbullied me",
      "vaped ominously",
      "started selling NFTs",
      "told me they voted for Trump",
      "kidnapped my $object"
    ],
    transition: [
      "It was then to my horror I knew",
      "Then I realised",
      "My smile turned to horror as I realized",
      "Little did I know",
      "I found out",
      "I looked down and saw",
      "Last night",
      "I forgot that",
      "That’s when I knew",
      "Suddenly I realized,",
      "At that exact moment",
      "With no warning I saw that",
      "Regretfully, ",
    ],
    twist: [
      "I am $monster",
      "I'm married to $monster",
      "I was actually $monster",
      "I’m still in Ohio",
      "I got April Fooled",
      "Wes Modes was never real",
      "the $object was cursed",
      "I turned into a $monster",
      "I turned into my $object",
      "the $monster was a $object the whole time",
      "the government knew the whole time",
      "I was on a zoom call with $monster",
      "I was dead all along",
      "I was dreaming",
      "I was the $object the whole time",
      "$monster killed me",
      "the $object was never real",
      "the $object exploded",
      "$monster knew I was there",
      "$monster ate the $object",
      "$monster had my $object",
    ],
  };
  
  const template = `I $verb my $object as $monster $action. $transition $twist.`;
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    const memory = {}; 
    const slotPattern = /\$(\w+)/;
  
    function replacer(match, name) {
      if (memory[name]) {
        return memory[name];
      }
  
      const options = fillers[name];
      if (options) {
        const choice = options[Math.floor(Math.random() * options.length)];
        memory[name] = choice; 
        return choice;
      } else {
        return `<UNKNOWN:${name}>`;
      }
    }
  
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
    
    // separates into two lines
    const periodIndex = story.indexOf(".");
    const firstSentence = story.slice(0, periodIndex + 1);
    const secondSentence = story.slice(periodIndex + 2);
  
  
    /* global box */
    $("#box").text(firstSentence);
    $("#box1").text(secondSentence);
  
  }
  
  
  /* global clicker */
  $("#clicker").click(generate);
  
  generate();
  
  // create an instance of the class
  let myInstance = new MyProjectClass("value1", "value2");

  // call a method on the instance
  myInstance.myMethod();
}

// let's get this party started - uncomment me
main();