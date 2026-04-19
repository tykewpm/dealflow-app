/**
 * NextActionCard Usage Examples
 *
 * This file demonstrates how to use the NextActionCard component in different scenarios.
 */

import { NextActionCard } from './NextActionCard';
import { getNextAction } from '../../utils/nextActionHelpers';
import { Task } from '../../types';

// Example 1: Basic usage with on-track status
export function Example1_OnTrack() {
  return (
    <NextActionCard
      actionText="Schedule home inspection"
      dueDate="2026-04-25"
      priority="on-track"
      onMarkComplete={() => console.log('Marked complete')}
      onViewTask={() => console.log('View task')}
    />
  );
}

// Example 2: At-risk status with warning
export function Example2_AtRisk() {
  return (
    <NextActionCard
      actionText="Submit loan application"
      dueDate="2026-04-18"
      priority="at-risk"
      warningMessage="This task is due soon"
      atRiskCount={2}
      dueSoonCount={3}
      onMarkComplete={() => console.log('Marked complete')}
      onViewTask={() => console.log('View task')}
    />
  );
}

// Example 3: Overdue status with critical warning
export function Example3_Overdue() {
  return (
    <NextActionCard
      actionText="Complete contingency removal"
      dueDate="2026-04-14"
      priority="overdue"
      warningMessage="This may delay closing"
      atRiskCount={3}
      onMarkComplete={() => console.log('Marked complete')}
      onViewTask={() => console.log('View task')}
    />
  );
}

// Example 4: Real-world integration with deal data
export function Example4_Integration({ tasks }: { tasks: Task[] }) {
  const nextAction = getNextAction(tasks);

  if (!nextAction) {
    return (
      <div className="text-center py-8 text-text-muted">
        No pending actions - all tasks complete! 🎉
      </div>
    );
  }

  return (
    <NextActionCard
      actionText={nextAction.task.name}
      dueDate={nextAction.task.dueDate}
      priority={nextAction.priority}
      warningMessage={nextAction.warningMessage}
      onMarkComplete={() => {
        // Handle marking task complete
        console.log(`Mark complete: ${nextAction.task.id}`);
      }}
      onViewTask={() => {
        // Navigate to task or scroll to it
        console.log(`View task: ${nextAction.task.id}`);
      }}
    />
  );
}

// Example 5: Multiple cards in a dashboard view
export function Example5_Dashboard({ dealTasks }: { dealTasks: Task[][] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dealTasks.map((tasks, index) => {
        const nextAction = getNextAction(tasks);
        if (!nextAction) return null;

        return (
          <NextActionCard
            key={index}
            actionText={nextAction.task.name}
            dueDate={nextAction.task.dueDate}
            priority={nextAction.priority}
            warningMessage={nextAction.warningMessage}
            onMarkComplete={() => console.log(`Complete ${nextAction.task.id}`)}
            onViewTask={() => console.log(`View ${nextAction.task.id}`)}
          />
        );
      })}
    </div>
  );
}
