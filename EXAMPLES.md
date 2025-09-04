# 2do2 Usage Examples

## Quick Start Examples

```bash
# Basic setup
2do2 config set-token YOUR_TODOIST_API_TOKEN
2do2 config set default-project "Work"

# List tasks
2do2 list                    # All active tasks
2do2 ls                      # Short alias
```

## Daily Workflows

### Morning Review
```bash
# Check today's high-priority tasks
2do2 list -d today -r 4 -s priority

# Quick overview in minimal format
2do2 ls -d today -f minimal

# See what's overdue
2do2 ls -d overdue
```

### Adding Tasks
```bash
# Simple task (uses default project)
2do2 add "Review quarterly reports"

# Work task with deadline and alert
2do2 add "Client presentation" -p "Work" -d "tomorrow 2pm" -o -30

# Personal task with labels
2do2 add "Buy birthday gift" -p "Personal" -l "shopping,urgent" -r 3

# Task with no project (goes to Inbox)
2do2 add "Random idea" -p ""
```

### Quick Task Management
```bash
# Complete tasks using short IDs
2do2 comp abc1 def2 ghi3

# Update a task
2do2 update abc1 -t "Updated task content" -d "next friday" -o -15

# Delete tasks with confirmation
2do2 del abc1
2do2 delete abc1 def2 -y    # Skip confirmation
```

## Advanced Filtering

### Project-Based Workflows
```bash
# All work tasks
2do2 ls -p "Work"

# High-priority personal tasks
2do2 ls -p "Personal" -r 4

# Completed tasks in a project
2do2 ls -p "Project Alpha" -c
```

### Time-Based Filtering
```bash
# Today's tasks
2do2 ls -d today

# This week's tasks  
2do2 ls -d "2024-12-23"

# Overdue tasks
2do2 ls -d overdue

# Tomorrow's tasks with alerts
2do2 ls -d tomorrow | grep "\-.*m"
```

### Label-Based Organization
```bash
# Urgent tasks across all projects
2do2 ls -l urgent

# Meeting-related tasks
2do2 ls -l meeting

# Shopping tasks
2do2 ls -l shopping -p "Personal"
```

## Output Formatting

### Table View (Default)
```bash
2do2 ls -f table
# Shows: ID | Priority | Task | Project | Labels | Due Date | Offset
```

### Minimal View
```bash
2do2 ls -f minimal
# Shows: abc1  🔴 Task name (Project) - Due date [-10m]
```

### JSON Output
```bash
2do2 ls -f json > tasks.json
# Perfect for scripting and automation
```

## Project Management

```bash
# List all projects
2do2 projects list

# Create new project
2do2 projects add "Q1 2024 Goals"

# Delete old project (moves tasks to Inbox)
2do2 projects delete "Old Project" -y
```

## Label Management

```bash
# List all labels
2do2 labels list

# Create labels
2do2 labels add "urgent"
2do2 labels add "waiting-for"

# Remove unused labels
2do2 labels delete "old-label" -y
```

## Configuration Management

### View Current Settings
```bash
2do2 config show
```

### Common Configuration
```bash
# Set defaults
2do2 config set default-project "Work"
2do2 config set output-format "minimal" 
2do2 config set colours true

# Date format (using date-fns format)
2do2 config set date-format "yyyy-MM-dd HH:mm"

# Remove settings
2do2 config unset default-project
```

## Scripting Examples

### Bash Integration
```bash
#!/bin/bash
# Daily task review script

echo "=== TODAY'S HIGH PRIORITY TASKS ==="
2do2 ls -d today -r 4 -f minimal

echo ""
echo "=== OVERDUE TASKS ==="
2do2 ls -d overdue -f minimal

echo ""
echo "=== TASK COUNT ==="
echo "Today: $(2do2 ls -d today -f json | jq '.tasks | length')"
echo "Total: $(2do2 ls -f json | jq '.tasks | length')"
```

### Quick Task Entry
```bash
# Function to add task with current time + 1 hour
quick_task() {
    local content="$1"
    local due_time=$(date -d "+1 hour" "+%H:%M")
    2do2 add "$content" -d "$due_time" -o -10
}

quick_task "Follow up on email"
```

## Alert & Offset Examples

```bash
# Meeting alerts
2do2 add "Team standup" -d "tomorrow 9am" -o -5     # 5 min before
2do2 add "Client call" -d "friday 2pm" -o -15       # 15 min before

# Follow-up reminders  
2do2 add "Send proposal" -d "today 5pm" -o 30       # 30 min after
2do2 add "Check email" -d "today 6pm" -o 0          # Exactly at time

# Update existing task offset
2do2 update abc1 -o -20  # Change to 20 minutes before
```

## Batch Operations

```bash
# Complete multiple tasks
2do2 comp $(2do2 ls -p "Shopping" -f json | jq -r '.tasks[].id' | head -3)

# Delete all completed tasks from a project
2do2 ls -p "Old Project" -c -f json | jq -r '.tasks[].id' | xargs 2do2 del -y

# Move all personal tasks to work (update project)
for id in $(2do2 ls -p "Personal" -f json | jq -r '.tasks[].id'); do
    2do2 update $id -p "Work"
done
```

## Integration Tips

### Alfred Workflow
```bash
# Alfred script filter for quick task add
echo '{"items":[{"title":"Add task: $1","arg":"$1","subtitle":"Add to default project"}]}'
```

### Cron Jobs
```bash
# Daily task summary at 8 AM
0 8 * * * /usr/local/bin/2do2 ls -d today -f minimal | mail -s "Today's Tasks" you@example.com

# Weekly overdue reminder
0 9 * * 1 /usr/local/bin/2do2 ls -d overdue -f minimal > /tmp/overdue.txt && [ -s /tmp/overdue.txt ] && mail -s "Overdue Tasks" you@example.com < /tmp/overdue.txt
```

### Fish Shell Completions
```fish
# ~/.config/fish/completions/2do2.fish
complete -c 2do2 -s p -l project -d 'Project name'
complete -c 2do2 -s l -l label -d 'Label name'  
complete -c 2do2 -s d -l due -d 'Due date'
complete -c 2do2 -s r -l priority -d 'Priority 1-4'
complete -c 2do2 -s f -l format -d 'Output format' -xa 'table minimal json'
```