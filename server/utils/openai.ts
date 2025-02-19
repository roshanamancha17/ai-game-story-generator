// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import OpenAI from "openai";
import { StoryGenre, StoryLength } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StoryInput {
  genre: StoryGenre;
  gameTitle: string;
  mainCharacter: string;
  storyLength: StoryLength;
}

interface StoryOutput {
  title: string;
  introduction: string;
  mainQuest: string;
  sideQuests: string[];
  characters: Array<{
    name: string;
    role: string;
    description: string;
  }>;
}

interface IdeaGenerationInput {
  description: string;
}

interface IdeaGenerationOutput {
  genre: StoryGenre;
  gameTitle: string;
  mainCharacter: string;
  storyLength: StoryLength;
  conceptDescription: string;
}

interface PromptImprovementOutput {
  improvedPrompt: string;
  reasoning: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Circuit breaker state
let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_TIMEOUT = 60000; // 1 minute
let circuitBreakerTimer: NodeJS.Timeout | null = null;

function resetCircuitBreaker() {
  consecutiveFailures = 0;
  if (circuitBreakerTimer) {
    clearTimeout(circuitBreakerTimer);
    circuitBreakerTimer = null;
  }
}

function isCircuitOpen() {
  return consecutiveFailures >= FAILURE_THRESHOLD;
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  if (isCircuitOpen()) {
    throw new Error('Service temporarily unavailable. Please try again in a minute.');
  }

  let retries = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      const result = await operation();
      resetCircuitBreaker();
      return result;
    } catch (error: any) {
      if (error.status !== 429 || retries >= maxRetries) {
        consecutiveFailures++;

        if (consecutiveFailures >= FAILURE_THRESHOLD && !circuitBreakerTimer) {
          circuitBreakerTimer = setTimeout(() => {
            resetCircuitBreaker();
          }, CIRCUIT_RESET_TIMEOUT);
        }

        if (error.status === 429) {
          throw new Error('Too many requests. Please try again in a moment.');
        }

        throw error;
      }

      retries++;
      console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retries} of ${maxRetries})`);
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
}

// Rate limiting configuration
const FREE_TIER_LIMITS = {
  GENERATIONS_PER_DAY: 10,
  IMPROVE_PROMPT: true,
  GAMEPLAY_DETAILS: false,
};

const PREMIUM_TIER_LIMITS = {
  GENERATIONS_PER_DAY: 100,
  IMPROVE_PROMPT: true,
  GAMEPLAY_DETAILS: true,
};


// Simple rate limiter using a Map
const requestTimes = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 86400000; // 24 hours in milliseconds

function isRateLimited(userId: string, isPremium: boolean): boolean {
  const now = Date.now();
  const userRequests = requestTimes.get(userId) || [];

  // Remove requests older than the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  requestTimes.set(userId, recentRequests);

  const limit = isPremium ? PREMIUM_TIER_LIMITS.GENERATIONS_PER_DAY : FREE_TIER_LIMITS.GENERATIONS_PER_DAY;
  return recentRequests.length >= limit;
}

function addRequest(userId: string) {
  const userRequests = requestTimes.get(userId) || [];
  userRequests.push(Date.now());
  requestTimes.set(userId, userRequests);
}

// Fallback story generator for when OpenAI is unavailable
function generateFallbackStory(input: StoryInput): StoryOutput {
  const genreElements = {
    Fantasy: {
      setting: "mystical realm",
      antagonist: "dark sorcerer",
      items: ["ancient magical artifact", "enchanted weapon", "mystical map"],
      challenges: ["ancient curse", "magical barrier", "dragon's lair"]
    },
    "Sci-Fi": {
      setting: "distant space colony",
      antagonist: "rogue AI",
      items: ["advanced technology", "quantum device", "alien artifact"],
      challenges: ["system malfunction", "hostile aliens", "time paradox"]
    },
    Horror: {
      setting: "abandoned facility",
      antagonist: "supernatural entity",
      items: ["mysterious journal", "ritual components", "ancient relic"],
      challenges: ["psychological terror", "survival", "dark rituals"]
    },
    Mystery: {
      setting: "noir city",
      antagonist: "hidden mastermind",
      items: ["crucial evidence", "secret documents", "mysterious key"],
      challenges: ["complex conspiracies", "false leads", "time pressure"]
    },
    RPG: {
      setting: "vast open world",
      antagonist: "legendary warrior",
      items: ["legendary equipment", "rare resources", "ancient scrolls"],
      challenges: ["epic battles", "skill trials", "moral choices"]
    }
  };

  const elements = genreElements[input.genre];
  const introLength = input.storyLength === "Short" ? "brief" : input.storyLength === "Long" ? "epic" : "compelling";

  const story: StoryOutput = {
    title: input.gameTitle,
    introduction: `In the ${elements.setting} of ${input.gameTitle}, a ${introLength} tale unfolds. ${input.mainCharacter} emerges as an unlikely hero, destined to face the challenges that threaten this world. As darkness looms and the ${elements.antagonist} grows in power, our hero must rise to meet their destiny.`,
    mainQuest: `Defeat the ${elements.antagonist} who threatens to destroy the ${elements.setting}. Gather the ${elements.items[0]} and master its power before it's too late.`,
    sideQuests: [
      `Explore the ${elements.setting} to find the legendary ${elements.items[1]}.`,
      `Help the local inhabitants overcome the ${elements.challenges[0]}.`,
      `Investigate the mystery of the ${elements.items[2]} and its connection to the ${elements.antagonist}.`
    ],
    characters: [
      {
        name: input.mainCharacter,
        role: "Protagonist",
        description: `A determined hero who must overcome their limitations to save the ${elements.setting}. Armed with courage and destiny, they face the greatest challenges of their life.`
      },
      {
        name: `Guardian of the ${elements.items[0]}`,
        role: "Mentor",
        description: `An enigmatic figure who guides the hero in their quest to master the power of the ${elements.items[0]}.`
      },
      {
        name: `The ${elements.antagonist}`,
        role: "Antagonist",
        description: `A powerful force of evil threatening to unleash chaos upon the ${elements.setting}. Their mastery of ${elements.challenges[1]} makes them a formidable opponent.`
      }
    ]
  };

  return story;
}

// Modify the generateFallbackIdea function
function generateFallbackIdea(input: IdeaGenerationInput): IdeaGenerationOutput {
  const keywords = input.description.toLowerCase();
  let genre: StoryGenre = "Fantasy";

  if (keywords.includes("space") || keywords.includes("future") || keywords.includes("technology")) {
    genre = "Sci-Fi";
  } else if (keywords.includes("horror") || keywords.includes("scary") || keywords.includes("dark")) {
    genre = "Horror";
  } else if (keywords.includes("detective") || keywords.includes("solve") || keywords.includes("mystery")) {
    genre = "Mystery";
  } else if (keywords.includes("role") || keywords.includes("adventure") || keywords.includes("quest")) {
    genre = "RPG";
  }

  // Generate a more natural game title from the description
  const words = input.description.split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  const gameTitle = words.join(' ');

  // Extract potential character description from the input
  let mainCharacter = "A mysterious protagonist";
  if (input.description.toLowerCase().includes("play as") || input.description.toLowerCase().includes("control")) {
    const characterStart = Math.max(
      input.description.toLowerCase().indexOf("play as"),
      input.description.toLowerCase().indexOf("control")
    );
    if (characterStart !== -1) {
      const characterDescription = input.description.slice(characterStart).split('.')[0];
      mainCharacter = characterDescription.replace(/play as|control/i, '').trim();
    }
  }

  return {
    genre,
    gameTitle,
    mainCharacter,
    storyLength: "Medium",
    conceptDescription: input.description
  };
}

async function generateImprovedPrompt(
  input: IdeaGenerationInput,
  userId: string,
  isPremium: boolean = false
): Promise<PromptImprovementOutput> {
  try {
    if (isRateLimited(userId, isPremium)) {
      throw new Error(isPremium
        ? 'You have reached your premium tier daily limit. Please try again tomorrow.'
        : 'You have reached your free tier daily limit. Upgrade to premium for more generations!');
    }

    if (isCircuitOpen()) {
      return {
        improvedPrompt: input.description,
        reasoning: "Our AI assistant is taking a short break. Please try again in a minute."
      };
    }

    addRequest(userId);

    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at improving game concept descriptions to generate better game ideas. Help refine the user's input to include more specific details and creative elements."
          },
          {
            role: "user",
            content: `Improve this game concept description to include more specific details about gameplay, setting, and unique features:
            "${input.description}"

            Format the response as a JSON object with the following structure:
            {
              "improvedPrompt": "The improved description with more details",
              "reasoning": "Brief explanation of what was added/changed and why"
            }`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content) as PromptImprovementOutput;
  } catch (error: any) {
    console.error('Error improving prompt:', error);

    if (error.status === 429) {
      throw new Error('Please wait a moment before making another request.');
    }

    if (error.status === 401) {
      throw new Error('OpenAI service is currently unavailable. Please try again later.');
    }

    return {
      improvedPrompt: input.description,
      reasoning: "We couldn't improve your prompt right now. Please try again in a moment."
    };
  }
}

async function generateGameIdea(input: IdeaGenerationInput, userId: string, isPremium: boolean = false): Promise<IdeaGenerationOutput> {
  try {
    if (isRateLimited(userId, isPremium)) {
      throw new Error(isPremium
        ? 'You have reached your premium tier daily limit. Please try again tomorrow.'
        : 'You have reached your free tier daily limit. Upgrade to premium for more generations!');
    }

    if (isCircuitOpen()) {
      return generateFallbackIdea(input);
    }

    addRequest(userId);

    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative game designer who helps transform text descriptions into structured game concepts."
          },
          {
            role: "user",
            content: `Transform this description into a game concept:
            "${input.description}"

            Format the response as a JSON object with the following structure:
            {
              "genre": one of ["Fantasy", "Sci-Fi", "Horror", "Mystery", "RPG"],
              "gameTitle": "A catchy title for the game",
              "mainCharacter": "Description of the main character",
              "storyLength": one of ["Short", "Medium", "Long"],
              "conceptDescription": "A brief description of the core game concept"
            }`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content) as IdeaGenerationOutput;
  } catch (error: any) {
    console.error('Error generating game idea:', error);

    if (error.message.includes('Invalid API key') || error.status === 401) {
      throw new Error('The AI service is temporarily unavailable. Please try again in a few minutes.');
    }

    if (error.status === 429 || error.message.includes('rate limit')) {
      throw new Error('Please wait a moment before generating another idea.');
    }

    // For any other errors, use the fallback generator
    return generateFallbackIdea(input);
  }
}

async function generateGameStory(input: StoryInput, userId: string, isPremium: boolean = false): Promise<StoryOutput> {
  try {
    if (isRateLimited(userId, isPremium)) {
      throw new Error(isPremium
        ? 'You have reached your premium tier daily limit. Please try again tomorrow.'
        : 'You have reached your free tier daily limit. Upgrade to premium for more generations!');
    }

    if (isCircuitOpen()) {
      return generateFallbackStory(input);
    }

    addRequest(userId);

    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative game story writer who specializes in creating engaging game narratives."
          },
          {
            role: "user",
            content: `Create a ${input.storyLength.toLowerCase()} game story with the following details:
            Genre: ${input.genre}
            Game Title: ${input.gameTitle}
            Main Character: ${input.mainCharacter}

            Format the response as a JSON object with the following structure:
            {
              "title": "Game title",
              "introduction": "Story introduction",
              "mainQuest": "Main quest description",
              "sideQuests": ["Side quest 1", "Side quest 2"],
              "characters": [{
                "name": "Character name",
                "role": "Character role",
                "description": "Character description"
              }]
            }`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content) as StoryOutput;
  } catch (error: any) {
    console.error('Error generating story:', error);

    if (error.status === 429) {
      throw new Error('Please wait a moment before generating another story.');
    }

    if (error.status === 401) {
      throw new Error('OpenAI service is currently unavailable. Please try again later.');
    }

    return generateFallbackStory(input);
  }
}

interface GameplayDetails {
  playerMovement: {
    basicControls: string[];
    specialMoves: string[];
    navigationMechanics: string;
  };
  coreMechanics: {
    mainGameplay: string;
    uniqueFeatures: string[];
    progression: string;
  };
  combatSystem: {
    attackTypes: string[];
    defenseOptions: string[];
    specialAbilities: string[];
  };
  environmentInteraction: {
    interactiveElements: string[];
    environmentalMechanics: string;
    puzzleTypes: string[];
  };
}


// Add this new function after the other generation functions
async function generateGameplayDetails(
  input: IdeaGenerationOutput,
  userId: string,
  isPremium: boolean = false
): Promise<GameplayDetails> {
  if (!isPremium && !PREMIUM_TIER_LIMITS.GAMEPLAY_DETAILS) {
    // Return basic gameplay details for free tier
    return generateFallbackGameplayDetails(input);
  }

  try {
    if (isRateLimited(userId, isPremium)) {
      throw new Error(isPremium
        ? 'You have reached your premium tier daily limit. Please try again tomorrow.'
        : 'You have reached your free tier daily limit. Upgrade to premium for more generations!');
    }

    addRequest(userId);

    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a game design expert who specializes in creating detailed gameplay mechanics and systems."
          },
          {
            role: "user",
            content: `Create detailed gameplay mechanics for this game concept:
            Title: ${input.gameTitle}
            Genre: ${input.genre}
            Main Character: ${input.mainCharacter}
            Concept: ${input.conceptDescription}

            Format the response as a JSON object matching the GameplayDetails type with these sections:
            - playerMovement (basic controls, special moves, navigation)
            - coreMechanics (main gameplay loop, unique features, progression)
            - combatSystem (if applicable: attack types, defense options, special abilities)
            - environmentInteraction (interactive elements, environmental mechanics, puzzle types)`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content) as GameplayDetails;
  } catch (error: any) {
    console.error('Error generating gameplay details:', error);

    if (error.message.includes('Invalid API key') || error.status === 401) {
      throw new Error('The AI service is temporarily unavailable. Please try again in a few minutes.');
    }

    if (error.status === 429 || error.message.includes('rate limit')) {
      throw new Error('Please wait a moment before generating gameplay details.');
    }

    return generateFallbackGameplayDetails(input);
  }
}

function generateFallbackGameplayDetails(input: IdeaGenerationOutput): GameplayDetails {
  const genreDefaults: Record<StoryGenre, GameplayDetails> = {
    Fantasy: {
      playerMovement: {
        basicControls: ["Walk/Run", "Jump", "Dodge Roll"],
        specialMoves: ["Double Jump", "Wall Climb", "Magic Dash"],
        navigationMechanics: "Free-form exploration with unlockable movement abilities"
      },
      coreMechanics: {
        mainGameplay: "Action-adventure combat with magic abilities and exploration",
        uniqueFeatures: ["Spell Combining", "Environmental Magic", "Character Progression"],
        progression: "Unlock new spells and abilities through story progression and exploration"
      },
      combatSystem: {
        attackTypes: ["Melee Attacks", "Magic Spells", "Charged Attacks"],
        defenseOptions: ["Block", "Parry", "Magic Shield"],
        specialAbilities: ["Ultimate Spell", "Power Stance", "Element Fusion"]
      },
      environmentInteraction: {
        interactiveElements: ["Magic Crystals", "Ancient Mechanisms", "Hidden Passages"],
        environmentalMechanics: "Use magic to manipulate the environment and solve puzzles",
        puzzleTypes: ["Elemental Puzzles", "Pattern Recognition", "Time-based Challenges"]
      }
    },
    "Sci-Fi": {
      playerMovement: {
        basicControls: ["Walk/Run", "Jump", "Dash"],
        specialMoves: ["Jetpack Boost", "Gravity Manipulation", "Time Shift"],
        navigationMechanics: "Zero-gravity sections and tech-enhanced movement"
      },
      coreMechanics: {
        mainGameplay: "Sci-fi combat with high-tech weapons and gadgets",
        uniqueFeatures: ["Gadget System", "Tech Upgrades", "Time Manipulation"],
        progression: "Upgrade technology and unlock new abilities through research"
      },
      combatSystem: {
        attackTypes: ["Energy Weapons", "Tech Gadgets", "Drone Assists"],
        defenseOptions: ["Energy Shield", "Teleport Dodge", "Counter Hack"],
        specialAbilities: ["Overcharge Mode", "Drone Swarm", "Time Freeze"]
      },
      environmentInteraction: {
        interactiveElements: ["Computer Terminals", "Security Systems", "Power Nodes"],
        environmentalMechanics: "Hack and manipulate technology to progress",
        puzzleTypes: ["Hacking Minigames", "Circuit Programming", "Physics Puzzles"]
      }
    },
    Horror: {
      playerMovement: {
        basicControls: ["Walk/Crouch", "Sprint", "Peek"],
        specialMoves: ["Quick Turn", "Slide", "Hide"],
        navigationMechanics: "Stealth-focused movement with limited stamina"
      },
      coreMechanics: {
        mainGameplay: "Survival horror with resource management and stealth",
        uniqueFeatures: ["Sanity System", "Dynamic Fear Levels", "Environmental Storytelling"],
        progression: "Find better equipment and unlock safe areas"
      },
      combatSystem: {
        attackTypes: ["Light Attack", "Heavy Attack", "Last Resort"],
        defenseOptions: ["Block", "Dodge", "Counter"],
        specialAbilities: ["Adrenaline Rush", "Sixth Sense", "Fight or Flight"]
      },
      environmentInteraction: {
        interactiveElements: ["Light Sources", "Hidden Items", "Escape Routes"],
        environmentalMechanics: "Use environment to hide and survive",
        puzzleTypes: ["Escape Room Puzzles", "Symbol Matching", "Sound-based Puzzles"]
      }
    },
    Mystery: {
      playerMovement: {
        basicControls: ["Walk/Run", "Crouch", "Interact"],
        specialMoves: ["Focus Mode", "Quick Search", "Track Clues"],
        navigationMechanics: "Investigation-focused movement with detailed environment interaction"
      },
      coreMechanics: {
        mainGameplay: "Detective work with clue gathering and deduction",
        uniqueFeatures: ["Detective Vision", "Timeline Manipulation", "Deduction Board"],
        progression: "Unlock new investigation tools and abilities"
      },
      combatSystem: {
        attackTypes: ["Quick Strike", "Takedown", "Ranged Attack"],
        defenseOptions: ["Dodge", "Block", "Counter"],
        specialAbilities: ["Slow Motion", "Mark Targets", "Chain Takedown"]
      },
      environmentInteraction: {
        interactiveElements: ["Evidence", "Witnesses", "Crime Scenes"],
        environmentalMechanics: "Analyze and interact with crime scenes",
        puzzleTypes: ["Logic Puzzles", "Evidence Connection", "Code Breaking"]
      }
    },
    RPG: {
      playerMovement: {
        basicControls: ["Walk/Run", "Jump", "Dodge"],
        specialMoves: ["Roll", "Sprint", "Sneak"],
        navigationMechanics: "Open-world exploration with mount system"
      },
      coreMechanics: {
        mainGameplay: "Character progression with rich storytelling and choices",
        uniqueFeatures: ["Class System", "Skill Trees", "Reputation System"],
        progression: "Level up, learn new skills, and improve equipment"
      },
      combatSystem: {
        attackTypes: ["Light Attack", "Heavy Attack", "Special Skills"],
        defenseOptions: ["Block", "Parry", "Dodge Roll"],
        specialAbilities: ["Ultimate Ability", "Class Skills", "Combo Moves"]
      },
      environmentInteraction: {
        interactiveElements: ["NPCs", "Resources", "Points of Interest"],
        environmentalMechanics: "Rich world interaction with consequences",
        puzzleTypes: ["Dialogue Puzzles", "Environmental Challenges", "Optional Dungeons"]
      }
    }
  };

  // Start with genre defaults
  const baseDetails = genreDefaults[input.genre];

  // Customize based on input
  if (input.mainCharacter) {
    baseDetails.coreMechanics.uniqueFeatures.push(`Unique ${input.mainCharacter} Abilities`);
  }

  return baseDetails;
}

export { generateGameStory, generateGameIdea, generateImprovedPrompt, generateGameplayDetails };