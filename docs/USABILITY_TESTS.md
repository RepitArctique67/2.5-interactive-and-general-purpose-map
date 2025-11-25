# Usability Testing

## Test Plan

### Methodology

- **Remote Moderated Testing**: Screen sharing sessions with users (Zoom/Meet).
- **Unmoderated Testing**: Tasks set up on platforms like Maze or UserTesting (future).
- **Dogfooding**: Internal team uses the app for their own projects.

### Metrics

- **Time on Task**: How long does it take to find a specific city in 1850?
- **Success Rate**: Percentage of users who complete the task without help.
- **Error Rate**: Number of misclicks or "undo" actions.
- **SUS (System Usability Scale)**: Post-test questionnaire.

## Test Scenarios

### Scenario 1: Navigation & Timeline

**Task**: "Find Paris, France, and set the year to 1944."

- *Success Criteria*: User uses search or pans manually, then drags timeline slider or types year.
- *Common Pitfalls*: User cannot find the timeline slider; Search bar doesn't recognize "Paris".

### Scenario 2: Layer Management

**Task**: "Turn on the 'Population Density' layer and make it 50% transparent."

- *Success Criteria*: User opens Layer Panel, finds the layer, toggles it, and adjusts the opacity slider.
- *Common Pitfalls*: Layer Panel icon is not obvious; Opacity controls are hidden.

### Scenario 3: Data Exploration

**Task**: "Find out the population of Tokyo in 2020."

- *Success Criteria*: User clicks on Tokyo (if vector data exists) and reads the popup.
- *Common Pitfalls*: User doesn't know elements are clickable; Popup is off-screen.

## Reporting Template

| Participant | Scenario | Success/Fail | Time | Observations |
| :--- | :--- | :--- | :--- | :--- |
| P01 | 1 | Success | 45s | Struggled to find timeline initially. |
| P01 | 2 | Fail | - | Couldn't find opacity slider. |
| P02 | 1 | Success | 20s | Used search bar immediately. |

## Action Items

- [ ] Refine "Opacity" UI based on P01 feedback.
- [ ] Make Timeline more prominent on first load.
