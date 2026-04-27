// Prompt Generation System

class PromptEngine {
    constructor() {
        this.prompts = [];
    }

    addPrompt(prompt, weight) {
        this.prompts.push({ prompt, weight });
    }

    generatePrompt() {
        const totalWeight = this.prompts.reduce((sum, p) => sum + p.weight, 0);
        const randomNum = Math.random() * totalWeight;
        let cumulativeWeight = 0;

        for (const { prompt, weight } of this.prompts) {
            cumulativeWeight += weight;
            if (randomNum <= cumulativeWeight) {
                return prompt;
            }
        }
    }

    optimizePrompts() {
        this.prompts.sort((a, b) => b.weight - a.weight);
    }

    exportPrompts(format) {
        switch (format) {
            case 'json':
                return JSON.stringify(this.prompts);
            case 'csv':
                return this.prompts.map(p => `${p.prompt},${p.weight}`).join('\n');
            default:
                throw new Error('Unsupported format');
        }
    }
}

// Example Usage
const engine = new PromptEngine();
engine.addPrompt('Write a story about a robot.', 5);
engine.addPrompt('Create a poem about the sea.', 3);
engine.optimizePrompts();
console.log(engine.generatePrompt());
// Export prompts in JSON format
console.log(engine.exportPrompts('json'));