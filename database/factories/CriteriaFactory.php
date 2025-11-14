<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Rank;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Criteria>
 */
class CriteriaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $criteria = $this->getVolleyballCriteria();
        $randomCriterion = fake()->randomElement($criteria);

        return [
            'name' => $randomCriterion['name'],
            'rank_id' => Rank::where('name', $randomCriterion['rank'])->first()?->id ?? Rank::factory(),
            'category_id' => Category::where('name', $randomCriterion['category'])->first()?->id ?? Category::factory(),
        ];
    }

    /**
     * Get volleyball-specific criteria organized by category and rank
     *
     * @return array
     */
    private function getVolleyballCriteria(): array
    {
        return [
            // HITTING - Bronze
            ['category' => 'Hitting', 'rank' => 'Bronze', 'name' => 'Demonstrates proper arm swing technique with high elbow'],
            ['category' => 'Hitting', 'rank' => 'Bronze', 'name' => 'Makes contact with ball at highest point of jump'],
            ['category' => 'Hitting', 'rank' => 'Bronze', 'name' => 'Follows through with wrist snap on attacks'],
            ['category' => 'Hitting', 'rank' => 'Bronze', 'name' => 'Approaches using proper 3 or 4 step footwork'],

            // HITTING - Silver
            ['category' => 'Hitting', 'rank' => 'Silver', 'name' => 'Hits line and angle shots with control'],
            ['category' => 'Hitting', 'rank' => 'Silver', 'name' => 'Adjusts approach timing based on set location'],
            ['category' => 'Hitting', 'rank' => 'Silver', 'name' => 'Uses off-speed shots and tips strategically'],
            ['category' => 'Hitting', 'rank' => 'Silver', 'name' => 'Demonstrates consistent kill percentage in matches'],

            // HITTING - Gold
            ['category' => 'Hitting', 'rank' => 'Gold', 'name' => 'Executes back row attacks with power and accuracy'],
            ['category' => 'Hitting', 'rank' => 'Gold', 'name' => 'Hits around or off blockers effectively'],
            ['category' => 'Hitting', 'rank' => 'Gold', 'name' => 'Transitions quickly from defense to offense'],
            ['category' => 'Hitting', 'rank' => 'Gold', 'name' => 'Reads defensive positioning and exploits gaps'],

            // HITTING - Platinum
            ['category' => 'Hitting', 'rank' => 'Platinum', 'name' => 'Masters hitting from multiple positions (outside, middle, opposite)'],
            ['category' => 'Hitting', 'rank' => 'Platinum', 'name' => 'Executes slides, quicks, and combination plays'],
            ['category' => 'Hitting', 'rank' => 'Platinum', 'name' => 'Maintains high kill efficiency under pressure'],
            ['category' => 'Hitting', 'rank' => 'Platinum', 'name' => 'Demonstrates tooling and wiping the block techniques'],

            // BLOCKING - Bronze
            ['category' => 'Blocking', 'rank' => 'Bronze', 'name' => 'Maintains proper ready position at the net'],
            ['category' => 'Blocking', 'rank' => 'Bronze', 'name' => 'Jumps with hands above and over the net'],
            ['category' => 'Blocking', 'rank' => 'Bronze', 'name' => 'Penetrates hands across the net on blocks'],
            ['category' => 'Blocking', 'rank' => 'Bronze', 'name' => 'Lands safely without touching the net'],

            // BLOCKING - Silver
            ['category' => 'Blocking', 'rank' => 'Silver', 'name' => 'Executes proper footwork for blocking movements'],
            ['category' => 'Blocking', 'rank' => 'Silver', 'name' => 'Reads setter and anticipates attack direction'],
            ['category' => 'Blocking', 'rank' => 'Silver', 'name' => 'Forms effective double blocks with teammates'],
            ['category' => 'Blocking', 'rank' => 'Silver', 'name' => 'Channels hits to defensive teammates'],

            // BLOCKING - Gold
            ['category' => 'Blocking', 'rank' => 'Gold', 'name' => 'Times jump to match hitter\'s attack'],
            ['category' => 'Blocking', 'rank' => 'Gold', 'name' => 'Adjusts block position based on set location'],
            ['category' => 'Blocking', 'rank' => 'Gold', 'name' => 'Executes effective swing blocking technique'],
            ['category' => 'Blocking', 'rank' => 'Gold', 'name' => 'Transitions quickly from blocking to defense'],

            // BLOCKING - Platinum
            ['category' => 'Blocking', 'rank' => 'Platinum', 'name' => 'Leads and directs blocking assignments'],
            ['category' => 'Blocking', 'rank' => 'Platinum', 'name' => 'Reads opponent\'s offensive patterns and tendencies'],
            ['category' => 'Blocking', 'rank' => 'Platinum', 'name' => 'Executes commit and read blocking strategies'],
            ['category' => 'Blocking', 'rank' => 'Platinum', 'name' => 'Consistently achieves high block assist and solo block stats'],

            // SERVING - Bronze
            ['category' => 'Serving', 'rank' => 'Bronze', 'name' => 'Serves consistently in bounds from baseline'],
            ['category' => 'Serving', 'rank' => 'Bronze', 'name' => 'Demonstrates proper toss placement for serve'],
            ['category' => 'Serving', 'rank' => 'Bronze', 'name' => 'Uses proper weight transfer and follow through'],
            ['category' => 'Serving', 'rank' => 'Bronze', 'name' => 'Maintains low error rate on serves'],

            // SERVING - Silver
            ['category' => 'Serving', 'rank' => 'Silver', 'name' => 'Serves to specific zones and targets'],
            ['category' => 'Serving', 'rank' => 'Silver', 'name' => 'Executes both float and topspin serves'],
            ['category' => 'Serving', 'rank' => 'Silver', 'name' => 'Varies serving speed and placement strategically'],
            ['category' => 'Serving', 'rank' => 'Silver', 'name' => 'Achieves multiple service aces per match'],

            // SERVING - Gold
            ['category' => 'Serving', 'rank' => 'Gold', 'name' => 'Executes jump serve with power and accuracy'],
            ['category' => 'Serving', 'rank' => 'Gold', 'name' => 'Serves aggressively while maintaining consistency'],
            ['category' => 'Serving', 'rank' => 'Gold', 'name' => 'Targets weak passers and seams in serve receive'],
            ['category' => 'Serving', 'rank' => 'Gold', 'name' => 'Maintains serving runs and momentum in matches'],

            // SERVING - Platinum
            ['category' => 'Serving', 'rank' => 'Platinum', 'name' => 'Masters multiple serve types and trajectories'],
            ['category' => 'Serving', 'rank' => 'Platinum', 'name' => 'Serves with tactical awareness of game situations'],
            ['category' => 'Serving', 'rank' => 'Platinum', 'name' => 'Consistently disrupts opponent\'s offensive system'],
            ['category' => 'Serving', 'rank' => 'Platinum', 'name' => 'Demonstrates elite serve efficiency rating'],

            // PASSING - Bronze
            ['category' => 'Passing', 'rank' => 'Bronze', 'name' => 'Maintains proper platform angle for forearm pass'],
            ['category' => 'Passing', 'rank' => 'Bronze', 'name' => 'Gets into position behind the ball'],
            ['category' => 'Passing', 'rank' => 'Bronze', 'name' => 'Passes ball to target area near setter'],
            ['category' => 'Passing', 'rank' => 'Bronze', 'name' => 'Communicates and calls the ball'],

            // PASSING - Silver
            ['category' => 'Passing', 'rank' => 'Silver', 'name' => 'Passes serve receive accurately to setter'],
            ['category' => 'Passing', 'rank' => 'Silver', 'name' => 'Adjusts platform for different serve speeds'],
            ['category' => 'Passing', 'rank' => 'Silver', 'name' => 'Covers designated zone in serve receive'],
            ['category' => 'Passing', 'rank' => 'Silver', 'name' => 'Demonstrates consistent passing rating in matches'],

            // PASSING - Gold
            ['category' => 'Passing', 'rank' => 'Gold', 'name' => 'Passes jump serves with control and accuracy'],
            ['category' => 'Passing', 'rank' => 'Gold', 'name' => 'Reads server and anticipates serve placement'],
            ['category' => 'Passing', 'rank' => 'Gold', 'name' => 'Executes emergency passing techniques effectively'],
            ['category' => 'Passing', 'rank' => 'Gold', 'name' => 'Delivers perfect passes enabling quick offense'],

            // PASSING - Platinum
            ['category' => 'Passing', 'rank' => 'Platinum', 'name' => 'Leads serve receive and directs team positioning'],
            ['category' => 'Passing', 'rank' => 'Platinum', 'name' => 'Maintains elite passing efficiency under pressure'],
            ['category' => 'Passing', 'rank' => 'Platinum', 'name' => 'Handles serves from any location or speed'],
            ['category' => 'Passing', 'rank' => 'Platinum', 'name' => 'Demonstrates libero-level passing consistency'],

            // SETTING - Bronze
            ['category' => 'Setting', 'rank' => 'Bronze', 'name' => 'Uses proper hand position and ball contact technique'],
            ['category' => 'Setting', 'rank' => 'Bronze', 'name' => 'Sets ball with consistent height and location'],
            ['category' => 'Setting', 'rank' => 'Bronze', 'name' => 'Squares shoulders to target before setting'],
            ['category' => 'Setting', 'rank' => 'Bronze', 'name' => 'Calls for and receives second ball consistently'],

            // SETTING - Silver
            ['category' => 'Setting', 'rank' => 'Silver', 'name' => 'Delivers hittable sets to multiple positions'],
            ['category' => 'Setting', 'rank' => 'Silver', 'name' => 'Adjusts sets based on pass quality'],
            ['category' => 'Setting', 'rank' => 'Silver', 'name' => 'Executes back sets with accuracy'],
            ['category' => 'Setting', 'rank' => 'Silver', 'name' => 'Communicates offensive plays to hitters'],

            // SETTING - Gold
            ['category' => 'Setting', 'rank' => 'Gold', 'name' => 'Runs offensive system with tempo sets and combinations'],
            ['category' => 'Setting', 'rank' => 'Gold', 'name' => 'Sets from anywhere on court including out-of-system balls'],
            ['category' => 'Setting', 'rank' => 'Gold', 'name' => 'Reads blockers and distributes sets strategically'],
            ['category' => 'Setting', 'rank' => 'Gold', 'name' => 'Demonstrates consistent assist-to-error ratio'],

            // SETTING - Platinum
            ['category' => 'Setting', 'rank' => 'Platinum', 'name' => 'Directs complex offensive schemes and play sequences'],
            ['category' => 'Setting', 'rank' => 'Platinum', 'name' => 'Executes jump setting and attacking second balls'],
            ['category' => 'Setting', 'rank' => 'Platinum', 'name' => 'Provides leadership and court awareness to team'],
            ['category' => 'Setting', 'rank' => 'Platinum', 'name' => 'Maintains elite setting efficiency in competition'],
        ];
    }
}
