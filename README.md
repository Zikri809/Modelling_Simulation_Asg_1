# Modelling_Simulation_Asg_1

## Project Overview

This project is a discrete choice model for undergraduate programme selection.
It is based on the case study of Aiman choosing between six programmes:

- Pure Sciences
- Applied Sciences
- Engineering
- Accounting
- Management
- Arts

The model uses six decision factors:

- Interest
- Exam fit
- Career outlook
- Location fit
- Fee comfort
- Trying new areas

The web version can be hosted on GitHub Pages because it only uses HTML, CSS, and JavaScript.

## How To Run

Visit the deployed web model:

https://zikri809.github.io/Modelling_Simulation_Asg_1/


## How The Model Works

Each programme has ratings from 1 to 5.

```text
1 = very low
5 = very high
```

Each factor also has a weight.
The weight shows how important that factor is in the decision.

## Utility Formula

The utility score is calculated using a weighted sum.

```text
Utility = (Interest * w1)
        + (Exam * w2)
        + (Career * w3)
        + (Location * w4)
        + (Fees * w5)
        + (Explore * w6)
```

In short:

```text
Utility_i = sum(rating_ij * weight_j)
```

Where:

- `i` is the programme
- `j` is the decision factor
- `rating_ij` is the rating of programme `i` for factor `j`
- `weight_j` is the importance weight for factor `j`

## Multinomial Logit Formula

After utility is calculated, the model converts the utilities into probabilities.

```text
Probability_i = exp(Utility_i) / sum(exp(Utility_all_programmes))
```

This means a programme with a higher utility gets a higher probability.
However, other programmes still have some probability because student choice is uncertain.

## Weight Normalisation

If the user changes weights, the app checks whether the total is 100.

If the total is 100, the app uses the weights directly.

If the total is not 100, the app asks whether the user wants to scale the weights to 100.
This keeps the calculation fair because all weights must be comparable.

Example:

```text
Raw weights = 30, 20, 25, 10, 10, 5
Total = 100
```

These weights can be used directly.

If the total is not 100:

```text
Normalised weight = weight / total weight
```

## Local Storage

The web app stores the current session in browser local storage.
This means the user can refresh the page and keep the same input.

Stored data includes:

- programme ratings
- confirmed weights
- draft weights
- selected programme
- latest calculation result

The `Start new` button clears the saved session.

## Code Documentation

The JavaScript file includes comments explaining the main parts of the code.
The comments are still valid as code documentation because they explain:

- where the programme data comes from
- how user input is stored
- how priorities are cleaned and used
- how utility scores are calculated
- how the logit probability is calculated
- how the best programme is selected
- how local storage saves and loads the session

The main calculation happens in `calculateResults()`.
The main session storage functions are `saveSession()` and `loadSession()`.
