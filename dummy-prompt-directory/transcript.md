So today I want to talk about evaluating agents, and the first thing you need to know is that LLM as a judge is probably the most common pattern out there. People use it everywhere.

When I built my first agent, I used the ReAct pattern, which stands for Reasoning and Acting, and it took me about 123 lines of code to get a basic loop working. The full version ended up being around 300,422 tokens of training data, which is honestly not that much.

The core of the loop is a function called `runAgent` which takes a messages array and calls `generateText` under the hood. If you're using Vercel's AI SDK, you probably know this function already.

Another pattern worth mentioning is reflection, which is where the model critiques its own output and tries again. I also want to mention RAG, which is Retrieval Augmented Generation. People combine these all the time.

You can read more about this at https://www.aihero.dev/mcp-server-from-a-single-typescript-file which is where I first saw this technique.

Anyway, the main takeaway is if your agent has more than 7 tools, you should probably split it into sub-agents, and each sub-agent should have its own system prompt. That's basically it, thanks for listening.
