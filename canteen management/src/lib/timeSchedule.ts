import { MealTimeSlot, TimeSlotConfig } from '@/types';

export const TIME_SLOTS: Record<MealTimeSlot, TimeSlotConfig> = {
  BREAKFAST: {
    slot: 'BREAKFAST',
    label: 'Breakfast',
    timeRange: '7:00 AM – 11:00 AM',
    startHour: 7,
    endHour: 11,
  },
  LUNCH: {
    slot: 'LUNCH',
    label: 'Lunch',
    timeRange: '11:00 AM – 4:00 PM',
    startHour: 11,
    endHour: 16,
  },
  SNACKS: {
    slot: 'SNACKS',
    label: 'Snacks',
    timeRange: '4:00 PM – 7:00 PM',
    startHour: 16,
    endHour: 19,
  },
  DINNER: {
    slot: 'DINNER',
    label: 'Dinner',
    timeRange: '7:00 PM – 9:00 PM',
    startHour: 19,
    endHour: 21,
  },
  ALL_DAY: {
    slot: 'ALL_DAY',
    label: 'All Day',
    timeRange: '7:00 AM – 9:00 PM',
    startHour: 7,
    endHour: 21,
  },
};

/**
 * Determines current active meal slot according to real local time or simulated date.
 */
export function getCurrentMealSlot(date: Date = new Date()): MealTimeSlot {
  const hour = date.getHours();

  if (hour >= 7 && hour < 11) {
    return 'BREAKFAST';
  } else if (hour >= 11 && hour < 16) {
    return 'LUNCH';
  } else if (hour >= 16 && hour < 19) {
    return 'SNACKS';
  } else if (hour >= 19 && hour < 21) {
    return 'DINNER';
  } else {
    // Late night or early morning fallback to next slot or Lunch
    return 'LUNCH';
  }
}

/**
 * Checks if a specific meal slot is currently active
 */
export function isSlotActive(slot: MealTimeSlot, currentSlot: MealTimeSlot): boolean {
  if (slot === 'ALL_DAY') return true;
  return slot === currentSlot;
}

/**
 * Checks if a menu item is available in a given time slot
 */
export function isItemAvailableInSlot(
  servingSlots: MealTimeSlot[],
  activeSlot: MealTimeSlot
): boolean {
  if (servingSlots.includes('ALL_DAY')) return true;
  return servingSlots.includes(activeSlot);
}

/**
 * Format time slot details for display
 */
export function getTimeSlotInfo(slot: MealTimeSlot): TimeSlotConfig {
  return TIME_SLOTS[slot] || TIME_SLOTS.LUNCH;
}

