# 2do2

A powerful CLI tool for managing your Todoist items from the command line.

## Features

- List tasks with filtering and sorting options
- Add new tasks with projects, labels, and due dates
- Alert offset system (get notified before/after due time)  
- Date aliases with short forms (today/t, tomorrow/tm, next week/nw, next month/nm)
- Mark tasks as complete or incomplete using colour-coded short alphanumeric IDs (base36)
- Update task details (name, project, labels, priority, offset)
- Delete tasks
- Manage projects and labels
- Show projects feature (filter which projects display by default)
- Short aliases for all flags to minimize typing
- Comprehensive help system with smart error detection
- Colorful, attractive output with meaningful markup
- Sync with Todoist API

## Installation

### Option 1: Install from Local Directory (Current)

```bash
# Clone or navigate to the 2do2 directory
cd /Users/chris/zed/2do2

# Install dependencies and build
npm install

# Install globally from current directory
npm install -g .

# Verify installation
2do2 --version
```

### Option 2: Link for Development

```bash
# From the 2do2 directory
npm link

# This creates a global symlink to your local development version
2do2 --version
```

### Option 3: Run Without Installing

```bash
# From the 2do2 directory
npm start -- --version
npm start -- help
npm start -- list
```

## Configuration

Set up your Todoist API token:

```bash
2do2 config set-token YOUR_TODOIST_API_TOKEN

# Get help anytime
2do2 help
2do2 --help
2do2 -h
```

## Usage

### List Tasks

```bash
# List all tasks
2do2 list

# List tasks with filters
2do2 list --project "Work" --label "urgent"
2do2 list -p "Work" -l "urgent"
2do2 list --due today
2do2 list -d today
2do2 list -d t              # Today (short alias)
2do2 list -d tm             # Tomorrow (short alias)
2do2 list --completed       # Completed tasks (last day)
2do2 list -c
2do2 list -c -d today       # Tasks completed today
2do2 list -c -d 2024-01-15  # Tasks completed on specific date
2do2 list --priority 4
2do2 list -r 4

# Sort tasks
2do2 list --sort priority
2do2 list -s priority
2do2 list --sort due-date
2do2 list -s due-date
```

### Add Tasks

```bash
# Simple task (uses default project if configured)
2do2 add "Buy groceries"

# Task with explicit project override
2do2 add "Finish report" --project "Work" --due "tomorrow"
2do2 add "Finish report" -p "Work" -d "tomorrow"

# Task using default project with other options
2do2 add "Call client" --labels "urgent,phone" --priority 4
2do2 add "Call client" -l "urgent,phone" -r 4

# Override default project temporarily
2do2 add "Meeting with boss" -p "Personal" -d "2pm" --offset -5
2do2 add "Meeting with boss" -p "Personal" -d "2pm" -o -5

# Task with alert after due time (uses default project)
2do2 add "Call doctor" -d "tomorrow 3pm" -o 10

# Using date aliases
2do2 add "Meeting today" -d t -o -15     # Today with 15min alert
2do2 add "Tomorrow task" -d tm           # Tomorrow  
2do2 add "Next week goal" -d nw          # Next Monday
2do2 add "Monthly review" -d nm          # Next month

# Explicitly set no project (override default)
2do2 add "General reminder" --project "" -d "next week"
2do2 add "General reminder" -p "" -d "next week"
```

### Update Tasks

```bash
# Mark task as complete using short alphanumeric IDs (auto-disambiguates)
2do2 complete 2a5f       # Full short ID
2do2 comp 2a             # Short prefix (if unique)
2do2 comp 2a 5x 9z       # Multiple tasks at once

# Mark task as incomplete
2do2 uncomplete 2a
2do2 uncomp 5x

# Update task content
2do2 update 2a --content "Updated task description"
2do2 update 5x -t "Updated task description"

# Update task project and due date
2do2 update 2a --project "Personal" --due "next week"
2do2 update 5x -p "Personal" -d "next week"

# Update task with new offset (alert 15 minutes before)
2do2 update 2a --offset -15
2do2 update 5x -o -15
```

### Delete Tasks

```bash
2do2 delete 2a
2do2 del 5x 9z           # Delete multiple tasks
```

### Project Management

```bash
# List projects
2do2 projects list

# Add project
2do2 projects add "New Project"

# Delete project
2do2 projects delete PROJECT_ID
```

### Label Management

```bash
# List labels
2do2 labels list

# Add label
2do2 labels add "important"

# Delete label
2do2 labels delete LABEL_ID
```

### Show Projects Management

```bash
# List which projects are currently shown by default
2do2 show list

# Add projects to show by default (only these will display in list)
2do2 show add "Work"
2do2 show add "Personal"

# Remove a project from show list
2do2 show remove "Work"

# Clear show projects (show all projects again)
2do2 show clear
```

### Sync

```bash
# Force sync with Todoist
2do2 sync
```

## Configuration Options

```bash
# View current configuration
2do2 config show

# Set default project (new tasks will use this unless overridden)
2do2 config set default-project "Work"

# Set output format (table, json, minimal)
2do2 config set output-format table

# Set date format (default is now yyyy-MM-dd HH:mm)
2do2 config set date-format "yyyy-MM-dd HH:mm"

# Set default output format
2do2 config set output-format table

# Enable/disable colours
2do2 config set colours true

# Remove default project (tasks go to Inbox)
2do2 config unset default-project

# View current default project
2do2 config get default-project
```

## Completed Tasks

The `-c/--completed` flag shows completed tasks instead of active ones:

- **Default behaviour**: Shows completed tasks from the last day
- **With date filter**: Shows tasks completed on the specified date
- **Date format**: Use `YYYY-MM-DD`, date aliases (`today`, `t`, `tm`, etc.), or natural formats

```bash
2do2 list -c                    # Last day's completed tasks
2do2 list -c -d today          # Tasks completed today  
2do2 list -c -d 2024-01-15     # Tasks completed on specific date
2do2 list -c -d "last monday"  # Tasks completed last Monday
```

## Short Flag Reference

| Flag | Short | Description |
|------|-------|-------------|
| `--project` | `-p` | Filter by or set project |
| `--label` | `-l` | Filter by or set labels |
| `--due` | `-d` | Filter by or set due date |
| `--priority` | `-r` | Filter by or set priority (r for "rank") |
| `--sort` | `-s` | Sort results |
| `--completed` | `-c` | Show completed tasks |
| `--content` | `-t` | Set task content/text |
| `--offset` | `-o` | Set alert offset in minutes |
| `--format` | `-f` | Output format (table, minimal, json) |

## Help System

The CLI includes comprehensive help and smart error detection:

```bash
# General help
2do2 help
2do2 --help
2do2 -h

# Command-specific help
2do2 help add
2do2 add --help
2do2 list -h

# Get help on flags and features
2do2 help flags
2do2 help shortcuts
2do2 help ids        # Color-coded ID system
2do2 help dates      # Date aliases
```

### Smart Error Detection

The tool provides helpful warnings and suggestions:

```bash
# Invalid date format
$ 2do2 add "Task" -d "bad-date"
⚠️  Invalid date format 'bad-date'. Try: today, tomorrow, 2pm, "Dec 25", "2024-12-25"

# Ambiguous short ID
$ 2do2 comp abc
⚠️  Ambiguous ID 'abc' matches multiple tasks:
    abc123 - "Buy groceries"
    abc456 - "Call dentist"
Use a longer prefix: 2do2 comp abc1 or 2do2 comp abc4

# Task not found
$ 2do2 comp xyz
❌ No task found matching 'xyz'
💡 Try: 2do2 list to see all task IDs

# Missing required token
$ 2do2 list
❌ Todoist API token not configured
💡 Run: 2do2 config set-token YOUR_TOKEN

# Invalid priority
$ 2do2 add "Task" -r 5
⚠️  Priority must be 1-4. Using priority 4 instead.

# Conflicting flags
$ 2do2 list -c -d today
⚠️  --completed flag conflicts with --due filter. Showing completed tasks from today.

# Default project not found
$ 2do2 add "New task"
⚠️  Default project 'OldProject' not found. Using Inbox instead.
💡 Update with: 2do2 config set default-project "ValidProject"

# No default project set
$ 2do2 add "Task without project"
ℹ️  No default project configured. Task added to Inbox.
💡 Set default: 2do2 config set default-project "ProjectName"
```

## Short ID System

Tasks are assigned short, unique alphanumeric IDs with colour coding for better readability:

```bash
# List shows colour-coded short IDs
$ 2do2 list
📋 Tasks
2a   🔴 Buy groceries (Work)         Due: Today 6pm    
5x   🟡 Call dentist                 Due: Tomorrow     
9z   🟢 Review code (Dev)            Due: Dec 25       
4k   📝 Write docs                                     

# Colour coding helps distinguish similar characters:
# - Numbers (0-9): Cyan
# - Consonants (b,c,d,f...): Magenta
# - Vowels (a,e,i,o,u): Yellow

# Use shortest unique prefix
$ 2do2 comp 2a     # ✓ Works - unique
$ 2do2 comp 2      # ❌ Might be ambiguous if multiple IDs start with 2
$ 2do2 comp 9z     # ✓ Works - unique

# Get help on ID colour system
$ 2do2 help ids
```

## Output Formatting

### Colors and Icons

The CLI uses colours and icons for visual clarity:

**Task Priority & Status:**
- 🔴 **Red** - High priority (4) / Overdue
- 🟡 **Yellow** - Medium priority (3) / Due today  
- 🟢 **Green** - Low priority (1-2) / Future
- 📝 **Gray** - No priority / No due date
- ✅ **Green check** - Completed tasks
- ⏰ **Clock** - Tasks with offset alerts
- 🏷️ **Tag** - Labels
- 📁 **Folder** - Projects

**Short ID Colours:**
- 🔵 **Cyan** - Numbers (0-9)
- 🟣 **Magenta** - Consonants (b,c,d,f...)
- 🟡 **Yellow** - Vowels (a,e,i,o,u)

### Table Format (Default)

The table automatically adapts to your terminal width, emphasizing the Task column:

```
📋 Tasks (5 items)
ID   Pr.  Task                                            Project         Due Date
2a   🔴   Buy groceries for the week                      Work            Today 6pm
5x   🟡   Call dentist about appointment                  Personal        Tomorrow
9z   🟢   Review PR #123 and provide detailed feedback   Dev             Dec 25 2pm
4k   📝   Write comprehensive documentation               
7m   ⏰   Meeting prep for quarterly review               Work            Today 2pm
```

**Improvements:**
- **Terminal width aware**: Uses available space efficiently
- **Shorter headers**: "Priority" → "Pr." saves space
- **Task emphasis**: More space allocated to task descriptions
- **Labels hidden**: Removed by default to reduce clutter
- **Word wrapping**: Long tasks wrap within their column

### Minimal Format

```bash
2do2 list --format minimal
2a  Buy groceries (Work) - Today 6pm [-10m]
5x  Call dentist - Tomorrow  
9z  Review PR #123 (Dev) - Dec 25 2pm
7m  Meeting prep (Work) - Today 2pm [-5m]
```

### JSON Format

```bash
2do2 list --format json
{
  "tasks": [
    {
      "id": "2a",
      "fullId": "7438294829304",
      "content": "Buy groceries",
      "project_id": "2203306141",
      "priority": 4,
      "due": "2024-12-20T18:00:00Z",
      "offset": -10,
      "labels": ["urgent"]
    }
  ]
}
```

## Examples

```bash
# Morning routine: check today's tasks
2do2 list --due today --sort priority
2do2 list -d today -s priority

# Add a quick task with alert (uses default project if set)
2do2 add "Review PR #123" --due "2pm" --offset -10
2do2 add "Review PR #123" -d "2pm" -o -10

# Override default project for specific task
2do2 add "Personal errand" -p "Personal" -d "2pm" -o -10

# Complete multiple tasks
2do2 list --project "Shopping" | grep "bought" | 2do2 complete

# Weekly cleanup: list overdue tasks
2do2 list --due overdue
2do2 list -d overdue

# Quick high-priority task with immediate alert
2do2 add "Call emergency contact" -r 4 -o 0

# Set up show projects for focused workflow
2do2 show add "Work"               # Only show work tasks by default
2do2 show add "Personal"           # Add personal tasks too
2do2 list                          # Now only shows Work + Personal tasks

# Use short alphanumeric IDs for quick task management
2do2 list -f minimal | head -5     # See recent tasks with short format  
2do2 comp 2a 5x 9z                 # Complete multiple tasks at once

# Check tasks with visual formatting
2do2 list -d today -f table        # Today's tasks in colourful table
2do2 list -c -f minimal            # Completed tasks, minimal view
```

## API

The tool uses the Todoist REST API v2. Requires a valid Todoist account and API token.
