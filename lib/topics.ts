const physics = [
    "Newton's laws of motion and universal gravitation",
    "Conservation of energy and mass",
    "Laws of thermodynamics",
    "Theory of relativity (special and general)",
    "Quantum mechanics",
    "Electromagnetism (Maxwell's equations)",
    "Archimedes' principle",
    "Bernoulli's principle",
    "Ohm's law",
    "Kepler's laws of planetary motion",
    "Wave theory of light",
    "Heisenberg uncertainty principle",
    "Principle of least action",
    "Information theory (Shannon's work)",
    "Pauli exclusion principle",
    "Nuclear fission and fusion",
    "Chaos theory and butterfly effect",
    "Fluid dynamics (Navier-Stokes equations)",
    "Wave-particle duality",
    "Dark matter and dark energy",
    "Quantum entanglement",
    "Fermat's principle in optics"
];

const biology = [
    "Theory of evolution by natural selection",
    "Germ theory of disease",
    "DNA structure and function",
    "Cell theory",
    "Mendelian genetics",
    "Theory of antibiotics and microbial resistance",
    "Vaccination",
    "Photosynthesis",
    "Central dogma of molecular biology",
    "Population genetics (Hardy-Weinberg principle)",
    "Sexual selection theory",
    "Punctuated equilibrium",
    "Homeostasis",
    "Neuroplasticity",
    "Common descent",
    "Oxidative phosphorylation (cellular respiration)"
];

const chemistry = [
    "Atomic theory",
    "Periodic table of elements",
    "Chemical bonding theory",
    "Oxygen theory of combustion",
    "Chemical equilibrium (law of mass action)"
];

const astronomyCosmology = [
    "Heliocentrism",
    "Big Bang theory",
    "Stellar nucleosynthesis and evolution",
    "Cosmological inflation"
];

const geology = [
    "Plate tectonics and continental drift",
    "Uniformitarianism",
    "Glacial cycles and climate change"
];

const mathematics = [
    "Pythagorean theorem",
    "Boolean algebra",
    "Calculus (fundamental theorem)",
    "Fundamental theorem of arithmetic",
    "Central limit theorem",
    "Law of large numbers",
    "Gödel's incompleteness theorems"
];

const computerScience = [
    "Theory of computation (Turing machines)"
];

const economics = [
    "Supply and demand",
    "Comparative advantage",
    "Opportunity cost",
    "Market efficiency in finance"
];

const psychology = [
    "Operant and classical conditioning",
    "Cognitive dissonance",
    "Cognitive development (Piaget's stages)",
    "Gestalt principles of perception",
    "Theory of mind",
    "Bounded rationality in decision-making"
];

const ecology = [
    "Principle of competitive exclusion"
];

const medicine = [
    "Theory of general anesthesia"
];

const linguistics = [
    "Human language acquisition (Chomsky's work)"
];

const interdisciplinary = [
    "Game theory (Nash equilibrium)"
];

// Define the topic interface
export interface Topic {
    id: string;
    title: string;
    description?: string;
    childIDs: string[];
    parentIDs: string[];
    tags: string[];
    completePercentage: number;
}

export type TopicsMap = Record<string, Topic>;

// Create the structured topics data
export const topicsData: TopicsMap = {
    "ROOT": {
        id: "ROOT",
        title: "Foundational Knowledge",
        childIDs: ["physics", "biology", "chemistry", "astronomy", "geology", "mathematics", "computerScience", "economics", "psychology", "ecology", "medicine", "linguistics", "interdisciplinary"],
        parentIDs: [],
        tags: ["knowledge", "learning", "education"],
        completePercentage: 100
    },

    // Main categories
    "physics": {
        id: "physics",
        title: "Physics",
        description: "The study of matter, energy, and the interaction between them",
        childIDs: physics.map((title, i) => `physics-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["science", "natural science", "physical science"],
        completePercentage: 20
    },
    "biology": {
        id: "biology",
        title: "Biology",
        description: "The study of living organisms",
        childIDs: biology.map((title, i) => `biology-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["science", "natural science", "life science"],
        completePercentage: 15
    },
    "chemistry": {
        id: "chemistry",
        title: "Chemistry",
        description: "The study of substances and their interactions",
        childIDs: chemistry.map((title, i) => `chemistry-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["science", "natural science", "physical science"],
        completePercentage: 10
    },
    "astronomy": {
        id: "astronomy",
        title: "Astronomy & Cosmology",
        description: "The study of celestial objects and phenomena",
        childIDs: astronomyCosmology.map((title, i) => `astronomy-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["science", "space", "astrophysics"],
        completePercentage: 5
    },
    "geology": {
        id: "geology",
        title: "Geology",
        description: "The study of the Earth and its processes",
        childIDs: geology.map((title, i) => `geology-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["science", "earth science", "natural science"],
        completePercentage: 8
    },
    "mathematics": {
        id: "mathematics",
        title: "Mathematics",
        description: "The study of numbers, quantities, and shapes",
        childIDs: mathematics.map((title, i) => `mathematics-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["math", "formal science", "STEM"],
        completePercentage: 25
    },
    "computerScience": {
        id: "computerScience",
        title: "Computer Science",
        description: "The study of computers and computational systems",
        childIDs: computerScience.map((title, i) => `cs-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["tech", "programming", "STEM"],
        completePercentage: 30
    },
    "economics": {
        id: "economics",
        title: "Economics",
        description: "The study of production, distribution, and consumption of goods and services",
        childIDs: economics.map((title, i) => `economics-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["social science", "finance", "business"],
        completePercentage: 12
    },
    "psychology": {
        id: "psychology",
        title: "Psychology",
        description: "The study of mind and behavior",
        childIDs: psychology.map((title, i) => `psychology-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["social science", "behavior", "mental health"],
        completePercentage: 18
    },
    "ecology": {
        id: "ecology",
        title: "Ecology",
        description: "The study of organisms and their environment",
        childIDs: ecology.map((title, i) => `ecology-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["environmental science", "biology", "earth science"],
        completePercentage: 7
    },
    "medicine": {
        id: "medicine",
        title: "Medicine",
        description: "The study of diagnosis, treatment, and prevention of disease",
        childIDs: medicine.map((title, i) => `medicine-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["health", "biology", "clinical science"],
        completePercentage: 20
    },
    "linguistics": {
        id: "linguistics",
        title: "Linguistics",
        description: "The study of language and its structure",
        childIDs: linguistics.map((title, i) => `linguistics-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["language", "communication", "social science"],
        completePercentage: 5
    },
    "interdisciplinary": {
        id: "interdisciplinary",
        title: "Interdisciplinary Studies",
        description: "Studies that span multiple fields",
        childIDs: interdisciplinary.map((title, i) => `interdisciplinary-${i + 1}`),
        parentIDs: ["ROOT"],
        tags: ["cross-domain", "multi-field", "integrated"],
        completePercentage: 10
    },
};

// Create individual topic entries
// Physics topics
physics.forEach((title, index) => {
    const id = `physics-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["physics"],
        tags: ["physics", "science"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Biology topics
biology.forEach((title, index) => {
    const id = `biology-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["biology"],
        tags: ["biology", "life science"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Chemistry topics
chemistry.forEach((title, index) => {
    const id = `chemistry-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["chemistry"],
        tags: ["chemistry", "science"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Astronomy topics
astronomyCosmology.forEach((title, index) => {
    const id = `astronomy-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["astronomy"],
        tags: ["astronomy", "space", "cosmology"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Geology topics
geology.forEach((title, index) => {
    const id = `geology-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["geology"],
        tags: ["geology", "earth science"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Mathematics topics
mathematics.forEach((title, index) => {
    const id = `mathematics-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["mathematics"],
        tags: ["mathematics", "math"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Computer Science topics
computerScience.forEach((title, index) => {
    const id = `cs-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["computerScience"],
        tags: ["computer science", "programming"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Economics topics
economics.forEach((title, index) => {
    const id = `economics-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["economics"],
        tags: ["economics", "finance"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Psychology topics
psychology.forEach((title, index) => {
    const id = `psychology-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["psychology"],
        tags: ["psychology", "mind", "behavior"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Ecology topics
ecology.forEach((title, index) => {
    const id = `ecology-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["ecology"],
        tags: ["ecology", "environment"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Medicine topics
medicine.forEach((title, index) => {
    const id = `medicine-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["medicine"],
        tags: ["medicine", "health"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Linguistics topics
linguistics.forEach((title, index) => {
    const id = `linguistics-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["linguistics"],
        tags: ["linguistics", "language"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Interdisciplinary topics
interdisciplinary.forEach((title, index) => {
    const id = `interdisciplinary-${index + 1}`;
    topicsData[id] = {
        id,
        title,
        description: "",
        childIDs: [],
        parentIDs: ["interdisciplinary"],
        tags: ["interdisciplinary", "cross-domain"],
        completePercentage: Math.floor(Math.random() * 100)
    };
});

// Helper function to get all topics in a flat array for search functionality
export function getAllTopics(): Topic[] {
    return Object.values(topicsData);
}
