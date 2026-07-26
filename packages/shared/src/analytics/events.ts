/**
 * Activation events track key milestones in a user's onboarding and core funnel.
 */
export type ActivationEvent =
  | 'account_created'
  | 'email_verified'
  | 'profile_completed'
  | 'service_added'
  | 'prospect_submitted'
  | 'report_completed'
  | 'outreach_copied';

/**
 * Engagement events track ongoing usage and feature discovery.
 */
export type EngagementEvent =
  | 'regenerated_section'
  | 'finding_marked_useful'
  | 'export_generated'
  | 'call_prep_usage';

export interface EventProperties {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Central event dictionary ensuring we don't accidentally send
 * sensitive data to PostHog. The values should only be IDs or enums.
 */
export const AnalyticsEvents = {
  /**
   * Used for tracking activation funnel steps.
   */
  trackActivation: (eventName: ActivationEvent, properties?: EventProperties) => {
    return {
      event: eventName,
      properties,
    };
  },

  /**
   * Used for tracking daily engagement features.
   */
  trackEngagement: (eventName: EngagementEvent, properties?: EventProperties) => {
    return {
      event: eventName,
      properties,
    };
  },
};
