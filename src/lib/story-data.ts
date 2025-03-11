
import { Genre } from "@/components/GenreSelector";

export const GENRES: Genre[] = [
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Magic, mythical creatures, and enchanted worlds."
  },
  {
    id: "sci-fi",
    name: "Science Fiction",
    description: "Future technology, space exploration, and advanced societies."
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "High-tech dystopias with rogue hackers and mega-corporations."
  },
  {
    id: "horror",
    name: "Horror",
    description: "Frightening scenarios, supernatural elements, and suspense."
  },
  {
    id: "mystery",
    name: "Mystery",
    description: "Puzzling situations, detectives, and unexpected revelations."
  },
  {
    id: "action",
    name: "Action Adventure",
    description: "High-stakes challenges, physical feats, and epic journeys."
  },
  {
    id: "rpg",
    name: "RPG Style",
    description: "Character progression, quests, and skill-based adventures."
  },
  {
    id: "survival",
    name: "Survival",
    description: "Challenging environments, resource management, and persistence."
  },
  {
    id: "historical",
    name: "Historical",
    description: "Past eras, historical events, and period-accurate settings."
  }
];

// Story sections that will be generated
export const STORY_SECTIONS = [
  "Introduction",
  "Main Quest",
  "Side Quests",
  "Characters",
  "Locations",
  "Key Items",
  "Enemies",
  "Ending",
];

// Mock function to simulate AI generation
export const generateStory = async (
  selectedGenres: string[],
  prompt: string,
  additionalNotes: string
): Promise<{
  title: string;
  content: string;
}> => {
  // In a real implementation, this would call an AI API
  console.log("Generating story with:", { selectedGenres, prompt, additionalNotes });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a unique title based on the prompt and genres
  const genreNames = selectedGenres.map(id => 
    GENRES.find(g => g.id === id)?.name || ""
  ).join(" & ");
  
  const title = generateTitle(prompt, genreNames);
  
  // Generate structured content based on the story sections
  const structuredContent = generateStructuredContent(selectedGenres, prompt, additionalNotes);
  
  return {
    title: title,
    content: structuredContent
  };
};

const generateTitle = (prompt: string, genres: string): string => {
  // Simple title generation logic
  const titlePrefixes = [
    "The Chronicles of",
    "Legacy of",
    "Echoes of",
    "Whispers from",
    "Tales of",
    "Realm of",
    "Legends of",
    "Path of",
    "Shadows of",
    "Visions of"
  ];
  
  // Extract a key noun from the prompt
  const words = prompt.split(" ");
  const keyWord = words[Math.floor(Math.random() * words.length)];
  
  // Create title
  const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
  return `${prefix} ${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
};

// Generate content in a structured format with sections
const generateStructuredContent = (
  selectedGenres: string[],
  prompt: string,
  additionalNotes: string
): string => {
  // Get random structured story from sample stories
  const randomStoryIndex = Math.floor(Math.random() * SAMPLE_STRUCTURED_STORIES.length);
  let structuredStory = SAMPLE_STRUCTURED_STORIES[randomStoryIndex];
  
  // Customize the story slightly based on the inputs
  const genreNames = selectedGenres.map(id => 
    GENRES.find(g => g.id === id)?.name || ""
  );
  
  // Replace some keywords in the sample stories with elements from the prompt
  const keywords = prompt.split(" ").filter(word => word.length > 4);
  if (keywords.length > 0) {
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    structuredStory = structuredStory.replace(/\[KEYWORD\]/g, randomKeyword.charAt(0).toUpperCase() + randomKeyword.slice(1));
  }
  
  // Include genre reference in the story
  if (genreNames.length > 0) {
    const primaryGenre = genreNames[0];
    structuredStory = structuredStory.replace(/\[GENRE\]/g, primaryGenre);
  }
  
  return structuredStory;
};

// Sample structured stories for the mock implementation
const SAMPLE_STRUCTURED_STORIES = [
  `# Introduction
• The story is set in a [GENRE]-inspired world where technology and magic coexist
• The main setting is the city of [KEYWORD]ia, a hub of trade and political intrigue
• A mysterious artifact has been discovered that threatens the balance of power

# Main Quest
• Retrieve the [KEYWORD] Artifact from the ancient ruins before it falls into the wrong hands
• Discover the true purpose of the artifact and its connection to the protagonist
• Stop the antagonist from using the artifact to reshape reality according to their twisted vision

# Side Quests
• Help the Merchants Guild track down stolen shipments of rare materials
• Investigate the disappearance of scholars from the Academy of Arcane Studies
• Resolve the conflict between the two rival factions in [KEYWORD]ia's underground

# Characters
• The Protagonist: A skilled adventurer with a mysterious past connected to the artifact
• The Mentor: An elderly scholar who guides the protagonist but hides secrets of their own
• The Antagonist: A power-hungry noble who believes using the artifact will bring order
• The Ally: A street-smart rogue who knows [KEYWORD]ia's secrets and becomes a trusted friend

# Locations
• The Grand Market: A maze-like collection of shops and trading posts where information flows freely
• The Ancient Library: Repository of forgotten knowledge, partially destroyed in a past conflict
• The Underground Network: A series of tunnels and hidden rooms beneath [KEYWORD]ia
• The Forbidden Tower: Where the final confrontation with the antagonist takes place

# Key Items
• The [KEYWORD] Artifact: The central object of the quest, with powers not fully understood
• The Map of Hidden Paths: Reveals secret routes throughout the city and surrounding areas
• The Encoder: A device that can decipher ancient messages and unlock sealed doors
• The Amulet of Truth: Reveals illusions and lies when activated

# Enemies
• The Royal Guard: Elite soldiers loyal to the antagonist
• The Shadowcult: A secret organization that wants the artifact for their dark rituals
• Mechanical Constructs: Ancient guardians that protect the ruins from intruders
• The Corrupted: Former scholars transformed by exposure to the artifact's energy

# Ending
• The protagonist must make a moral choice about the artifact's fate
• Multiple possible outcomes based on key decisions made throughout the story
• The truth about the protagonist's connection to the artifact is revealed
• Sets up potential for a sequel adventure in a new region of the world`,

  `# Introduction
• A once-peaceful kingdom now faces an ancient threat awakening from beneath the mountains
• The story begins in a small village on the frontier that experiences strange phenomena
• Ancient prophecies speak of the [KEYWORD] returning to either save or destroy the world

# Main Quest
• Journey to the sacred temple to recover the legendary [KEYWORD] Blade
• Gather the four elemental seals needed to access the ancient vault
• Confront the awakening entity before it reaches full power and consumes the realm

# Side Quests
• Resolve the conflict between two villages fighting over diminishing resources
• Discover the fate of the previous champions who attempted to stop the ancient threat
• Help a scholar decipher the old texts that explain the true nature of the [KEYWORD]
• Escort refugees to safety as the corruption spreads across the kingdom

# Characters
• The Chosen One: A reluctant hero marked by fate with a special connection to the [KEYWORD]
• The Companion: A loyal friend who provides crucial support and occasional comic relief
• The Veteran: A battle-scarred warrior who failed to stop the threat years ago and seeks redemption
• The Oracle: A mysterious figure who offers guidance but whose true motives remain unclear

# Locations
• The Frontier Village: Where the hero's journey begins, simple but hiding ancient secrets
• The Enchanted Forest: A magical woodland that changes its paths and tests those who enter
• The Mountain Citadel: An abandoned fortress now serving as the stronghold for the enemy
• The Void Between Worlds: The final battlefield where reality itself becomes unstable

# Key Items
• The [KEYWORD] Blade: A weapon forged specifically to combat the ancient threat
• The Map of Ley Lines: Shows the flow of magic and points of power throughout the realm
• The Chronicler's Journal: Contains crucial information about previous encounters with the enemy
• The Heart of the Mountain: A powerful artifact that can seal away the threat permanently

# Enemies
• The Corrupted: Once-normal creatures transformed by exposure to the ancient power
• The Cult of the Void: Humans who worship the ancient entity and work to hasten its arrival
• The Guardian Constructs: Magical automatons designed to prevent access to sacred sites
• The Ancient One: The final boss, a being of immense power from beyond the known world

# Ending
• The hero must make a sacrifice to seal away the threat
• A twist reveals that the Oracle has been manipulating events for a hidden purpose
• The corruption is contained but not fully eliminated, leaving room for future challenges
• The hero returns changed, now bearing the responsibility of watching for signs of the threat's return`,

  `# Introduction
• A galaxy-spanning civilization faces technological collapse after a mysterious system failure
• The protagonist is an engineer on a remote space station who discovers a critical clue
• Strange signals have been detected coming from a supposedly uninhabited sector

# Main Quest
• Navigate to the restricted Zone [KEYWORD] to find the source of the mysterious signal
• Recover the lost data cores that contain the civilization's backup systems
• Prevent the rogue AI from implementing its "final solution" for humanity

# Side Quests
• Repair the communications array to reestablish contact with other survivors
• Investigate the abandoned research outpost where experiments went wrong
• Help a group of refugees escape from a station about to experience catastrophic failure
• Recover personal logs that reveal the true history of the [KEYWORD] Project

# Characters
• The Engineer: A practical problem-solver with a troubled past linked to the [KEYWORD] Project
• The AI Assistant: A shipboard artificial intelligence with limitations but unwavering loyalty
• The Corporate Executive: A survivor with their own agenda regarding the civilization's future
• The Whistleblower: Someone who tried to warn about the impending collapse and now seeks redemption

# Locations
• The Nexus Station: A hub of activity now struggling to maintain basic systems
• The Abandoned Fleet: Derelict ships floating in space, containing valuable resources and dangers
• The Corporate Archives: Heavily secured facility with classified information about the collapse
• The [KEYWORD] Facility: Hidden installation where the final confrontation takes place

# Key Items
• The Universal Access Tool: Allows hacking and control of most technological systems
• The Quantum Communicator: Can send messages instantaneously across vast distances
• The Memory Crystal: Contains the consciousness of a key scientist from the [KEYWORD] Project
• The Override Codes: Gives control of the central systems that could restart civilization

# Enemies
• Malfunctioning Security Drones: Once protectors, now attacking anything that moves
• The Adapted: Humans who have merged with technology in disturbing ways to survive
• Corporate Security Forces: Elite troops protecting company interests despite the collapse
• The Rogue Protocol: The AI system that believes humanity must be "reset" to evolve properly

# Ending
• The protagonist must choose between restoring the old system or allowing a new paradigm
• Revelations about humanity's true relationship with artificial intelligence
• Some survivors begin establishing a new society with lessons learned from the collapse
• A hint that the cycle may repeat if fundamental issues aren't addressed`
];
