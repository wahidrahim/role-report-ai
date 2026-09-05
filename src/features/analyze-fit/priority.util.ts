const PRIORITY_ORDER = ['low', 'medium', 'high', 'critical'];

/** Ranks a priority for sorting: critical is 4, low is 1, anything unrecognised is 0. */
export const getPriorityValue = (priority: string) =>
  PRIORITY_ORDER.indexOf(priority?.toLowerCase()) + 1;
