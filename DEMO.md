# Demoing Otterbank

A mobile bank for demoing Unleash. All flags are evaluated in the
backend. For setup: see the [README](README.md).

## The flags

| Flag | What it does |
|------|--------------|
| `instant-transfers` | "Send money instantly" card on Home. Plain on/off kill switch. |
| `spending-assistant` | The floating otter 🦦 and its chat. Configured with a release template using time-based milestone progression. A safeguard on `thumbs_down_count` turns the feature off. |
| `spending-assistant-tone` | How the assistant talks: `classic` or `sassy` 😏. A/B test, scored per tone: `thumbs_down_classic_count` vs `thumbs_down_sassy_count` (thumbs-up counterparts too). |
| `savings-boost` | Savings card on the Payments tab. Three variants: `round-up`, `goal-tracker`, `cashback`. Scored per variant: `savings_cta_click_round_up_count`, `savings_cta_click_goal_tracker_count`, `savings_cta_click_cashback_count`. |

## The demo panel

Tap the **demo** badge in the header: switch users, reset the session,
see live flag assignments.

## The story (optional)

You're Otterbank's product team:

- Instant transfers shipped behind a kill switch. Payments incidents are expensive.
- The AI assistant rolls out gradually. Enough thumbs-down and Unleash turns the feature off.
- Product has three theories about what helps users save the most. We run all three and let behavior decide.
- Should the assistant be sassy? We test the engagement to see what happens.

## Demoing experimentation

**Variants.** Payments tab. Switch users in the demo panel: the
savings pitch changes. Tap the card's button a few times as different
users, then chart the three `savings_cta_click_{variant_name}_count` metrics against
each other. For the exposure side, use the **Metrics** tab.

**Full-stack experimentation.** Ask the assistant the same question
as two users, one classic, one sassy. Same UI, different backend
behavior. Tap thumbs, then compare the per-tone charts:
`thumbs_down_classic_count` vs `thumbs_down_sassy_count`.

**Stickiness.** By default, assignments stick to the `userId`.
So out of the box, switching users in the demo panel changes
the variant, and "New session" changes nothing. To show session-based
behavior instead, set stickiness to `sessionId` on the `savings-boost`
strategy: now "New session" reshuffles the pitch, and switching users
does nothing.