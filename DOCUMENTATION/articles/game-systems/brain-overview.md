# Brain Overview

> This article is adapted from [The AI of Creatures](https://www.alanzucconi.com/2020/07/27/the-ai-of-creatures/) by **Alan Zucconi** (July 27, 2020). The original article covers the full AI architecture of the Creatures series. This page reproduces the "Brain" and "Learning" sections with locally-served illustrations. All illustrations are credited to Alan Zucconi.

---

## The Brain

Creatures was so technically advanced that you could literally talk to your Norns, and they could talk back to you. But how could, a game developed in 1996, achieve so much ...with so little computational power available?

First-generation Norns are controlled by what we would call today a four-layer neural network, consisting of 952 neurons and around 5000 connections between them.
These neurons are organised in 9 functionally distinct groups, which Creatures called "lobes", to mirror the terminology used to study and classify actual brains.

![Brain lobe organization](images/brain_c1_02.png)

In the game, each creature can perform 11 actions such as moving left, moving right, stopping, sleeping and speaking. All of the others (like pushing and pulling) require an object instead. The behaviour of every creature is then defined by two pieces of information: which action to perform, and which object to perform it onto.

This is reflected in their brain structure, which has two lobes called "Decision" and "Attention". Respectively, they choose which action to take, and which object the creature has focused their attention onto.

The Decision lobe has a neuron associated with each action that can be performed.
At any given time, a creature is performing the action associated with the neuron that has the highest value. This behaviour is called "Winner Takes All", since only the strongest neuron in the lobe is the one that will ultimately determine which action the creature is doing.

The Attention lobe, instead, has 40 neurons, enough to represent the 26 categories of objects in the game. The neuron with the highest value determines which object the creature will be focused on.

For instance, if the decision is "push" and the attention is on "food", the creature will eat the closest piece of food. Yes, pushing food in Creatures is how you eat it.

Deciding which object the creature is interested in is relatively easy to calculate. Each neuron in the "Attention" lobe (and, consequently, each class of object the creature can interact with) is connected to the "Stimulus Source" and the "Noun" lobes.

Like the "Attention" lobe, they both have 40 neurons each, which maps again onto the types of objects available in the game. Neurons in the "Stimulus Source" lobe fire up based on which objects are being seen by the creature. If a creature sees a toy, the neuron associated with the concept of "toy" will increase its activity. And if the toy is making a sound, its neuron will be even more active.

Neurons in the "Noun" lobe, instead, activate when the player is typing the name of an object. Typing "push toy", for instance, will cause the neuron associated with "toy" in the "Noun" lobe to fire up.

This allows some control over which object a creature will act upon, regardless of how interesting it is. Both the "Stimulus Source" and the "Noun" lobes operate on a "Winner Takes All" policy. Meaning that at any given time, only the most attractive object and the most recent spoken word are being considered.

The "Attention" lobe sums up the results from the "Stimulus Source" and "Noun" lobes.
The neuron with the highest response will determine which class of object the creature is looking at.

![Attention lobe connections to Stimulus Source and Noun lobes](images/brain_c1_03.png)

In the same way the "Attention" lobe determines what class of object a creature is looking at, the "Decision" lobe determines which actions to take. Each neuron corresponds to an action the creature can perform, such as going left, going right, speaking, pushing, pulling, and so on. Every second or so, the neuron with the highest value determines which action the creature performs.

Each neuron has 256 connections, from as many neurons in the "Concept" lobe. You can imagine neurons in the concept lobe as "situations" the creature can be in. Out of the 256 connections each "Decision" neuron can receive, 128 of these will contribute positively towards the action it represents, suggesting it is the right thing to do.

The other 128 will contribute negatively, discouraging the creature from performing a certain action in the situation they represent. The "Concept" Lobe is not only the biggest lobe, but also the most complex. Each neuron receives inputs from one to three other neurons in the "Perception" lobe.

![Concept lobe neural connections](images/brain_c1_05.png)

Intuitively, its neurons fire up when certain situations occur. For instance, a specific neuron could represent the condition "I am hungry and food is near me". The concept lobe is, essentially, a collection of "perceptible things".

Each neuron is in fact connected to the "Perception" lobe, which contains all of the inputs ("the perceptions") that a creature can use for their decision making.

In reality, the perception lobe is nothing more than a container for the "Drive", the "Verb", the "General Sense" and the "Attention" lobes. This was necessary because, due to technical limitations, a lobe could only be connected to two other lobes. Copying the values of four lobes into a new one, allowed to overcome this limitation and to connect all of them to the "Concept" lobe.

The "Drive" lobe has 16 neurons, 13 of which are used to indicate the physical and emotional state of a creature. Its neurons map drives such as "pain", "hotness", "coldness", "hunger", "fear" and so on, which mirrors the creature's chemical reactions in their body.

Similarly, the "General Sense" lobe is used for specific events such as being patted, being slapped and bumping into a wall. Some neurons also activate based on properties of the object the creature is interested on (whether is active or not, for instance) and, if they are watching another creature, they can also tell if it is of the same species and whether or not it is their parent, child or sibling.

The "Verb" lobe works in the exact same way the "Noun" lobe does, activating when the user is typing certain verbs. This is once again done so that the player can have some influence over the decision-making process of the creature.

Interestingly, the "Attention" lobe is used both as output and input. Because its values are calculated using the "Stimulus Source" and "Noun" lobes, the "Perception" lobe effectively summarises all of the information a creature receives — both from their surrounding and their body.

It should now be clear why the neurons in the concept lobe represent "situations" the creature can find themself in. For instance, if we connect the "Hunger" neuron from the Drive lobe, the "Food" neuron from the Attention lobe, and the "It is near me" neuron from the "General Sense" lobe, we can represent a scenario in which the creature is hungry and is looking at a piece of food that is within reaching distance.

![Example: hungry + food + near me = concept neuron](images/brain_c1_04.png)

In a well-trained brain, this neuron should strongly contribute to the "push" action
since "pushing food" is how creatures eat food, in case you forgot!

The original genome also poses some constraints on how connections from the perception to the "Concept" lobe can form. For instance, out of the three connections, only one drive and one verb can be used. You cannot have a single "Concept" neuron indicating that the creature is both "hungry" and "bored".

This is likely because Creatures models feelings such as "hotness" and "coldness" as two separate drives. And ensuring that only one drive could be linked to each "Concept" neuron avoids a lot of situations that would otherwise be impossible to occur.

## The Learning

It is undeniable that the idea of arranging the lobes in the shape of a human brain was rather unfortunate. If we rearrange them "properly", it is much easier to understand not only how a Norn's brain works, but also how closely it resembles a modern neural network.

![Lobes rearranged as a modern neural network](images/brain_c1_06.png)

With everything that has been said so far, it should be clear that the "intelligence" of a creature really depends on how their perception, concept and decision lobes are wired.

Yet, when a creature is born, those connections are initialised randomly, leaving up to them to learn the best way to form memories and to use them to their advantage.
Not only was Creatures the first popular game to heavily feature Artificial Life and Artificial Intelligence; it was also the first to rely on Machine Learning.

If any Machine Learning practitioner were to recreate a Norn's brain with today's knowledge and technology, it would make sense to have the lobes fully connected with each other. That means that each neuron in the "Decision" lobe, for instance, wouldn't be connected to just 256 other neurons from the "Concept" lobe. It would be connected to all of them.

Even something as small as a Norn's brain, with its 952 neurons, would require over a million connections. While that may sound a large number, it is a fairly small amount for today's neural networks. For comparison, that could be the number of connections that you would need to classify hand-written digits from the MNIST dataset using the most vanilla approach possible.

Yet, that was an impossibly large number back in 1996.

Steve Grand, the creator of Creatures, wrote in one of his papers that "*the total number of cells that would be required to represent all possible sensory permutations of up to four inputs is unfeasibly large.*"

Out of those one million potential connections, Creatures could only afford 5000. Steve Grand found a way to ensure that only the most relevant 5000 connections would actually be stored in a creature's brain.

To do so, he designed a system based on three mechanisms: reinforcement, atrophy and migration. Each connection has a "strength", that represents how useful that connection has been. Every time a creature does something good, they get rewarded and this strengthens the connection.

For instance, if the creature is eating food while hungry, the connections that led to such an action will get stronger, as the "hunger" drive has been satisfied. On the contrary, if an action puts the creature in danger, the connections responsible will get weakened over time.
For instance, if a Norn is scared and decides to approach a grendel, their "fear" drive will worsen, weakening the connections that have caused such a poor decision.

Over time, that connection will get so weak that it will detach itself and reattach to another neuron. This leads to the formation of neural circuits that are relevant to the creature's survival skill in their current environment.

While not ideal, this solution is clever, is efficient, and it encourages the network to actually store only the memories that are relevant to survive. In modern terms, we would say that these limitations force the network to learn a "sparse representation" of the world.

### The Instincts

There is one final, missing piece that we need, to really understand how a Norn's brain works. The learning mechanism relies on rewards and punishments that need to be administered after every action. Without those constant inputs, it might not be obvious if an action was "good" or "bad". Yet, expecting the player to manually reward or punish a creature after every action would make for a rather tedious game.

Creatures solved this problem by introducing "instincts". They are specific genes designed to trigger rewards or punishments when specific conditions are met.

First-generation Norns are genetically engineered to have 19 basic instincts.
11 are used to reward them when they perform the action requested by the player,
2 are used to encourage courtship and mating — literally pushing and pulling —
and the rest are used to eat when hungry to avoid overcrowded spaces, to sleep when tired and finally, to push, pull and wander around when bored. These provide a basic, yet sufficient set of skills to survive. Creatures 2 will further expand the list, from 19 to 44.

And on top of that, each neuron does more than simply relaying input signals. Its internal state is computed via a genetically defined function called a "State-Variable Rule". These rules decide how neurons process inputs, and precede a damping mechanism that simulates how electric signals propagate through real neurons.

![Neuron signal damping and relaxation](images/brain_relaxation.png)

### From Creatures 1 to Creatures 3

> **Note**: The content above describes the **Creatures 1** brain architecture (1996). Creatures 3 (1999) significantly expanded the brain, growing from 9 lobes / 952 neurons to **16 lobes / 700+ neurons** organized differently. Key changes include the removal of the "Perception" relay lobe, the addition of the [Combination (comb)](#/article/combination-lobe-architecture) lobe as a 40x11 decision matrix replacing the Concept lobe, new lobes for [smell](#/article/smell-lobe-architecture), [motion detection](#/article/move-lobe-architecture), [social relationships](#/article/friendorfoe-lobe-architecture), and [emotional valence](#/article/mood-lobe-architecture), plus a fully programmable SVRule virtual machine with 68 opcodes. See the [Brain & Neural Networks](#/article/brain-system) article for the complete Creatures 3 lobe reference.

---

*Source: [The AI of Creatures](https://www.alanzucconi.com/2020/07/27/the-ai-of-creatures/) by Alan Zucconi, July 27, 2020. Illustrations by Alan Zucconi. Reproduced with attribution for educational reference.*
