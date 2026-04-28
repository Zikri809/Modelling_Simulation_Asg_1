
% Run with: aiman_discrete_choice_model

clear;
clc;
close all;

programmes = {
  "Pure Sciences";
  "Applied Sciences";
  "Engineering";
  "Accounting";
  "Management";
  "Arts"
};

factors = {"Interest", "Exam", "Career", "Location", "Fees", "Explore"};

% Ratings from the assignment table, where 1 = very low and 5 = very high.
X = [
  5, 5, 3, 3, 4, 2;
  4, 5, 4, 3, 3, 3;
  4, 5, 5, 2, 5, 2;
  3, 4, 4, 4, 4, 2;
  3, 3, 3, 5, 3, 3;
  2, 3, 2, 4, 2, 4
];

% Weights from the assignment table.
w = [0.30; 0.20; 0.25; 0.10; 0.10; 0.05];

printf("Aiman undergraduate programme discrete choice model\n");
printf("====================================================\n\n");
printf("Default ratings loaded from the assignment table.\n");

answer = input("Do you want to adjust any ratings? y/n [n]: ", "s");
if strcmpi(answer, "y")
  keep_editing = true;
  while keep_editing
    printf("\nProgrammes:\n");
    for i = 1:numel(programmes)
      printf("%d. %s\n", i, programmes{i});
    endfor

    p = input("Choose programme number to edit: ");
    if isempty(p) || p < 1 || p > numel(programmes)
      printf("Invalid programme. Keeping existing values.\n");
    else
      printf("\nFactors:\n");
      for j = 1:numel(factors)
        printf("%d. %s (current value = %d)\n", j, factors{j}, X(p, j));
      endfor

      f = input("Choose factor number to edit: ");
      if isempty(f) || f < 1 || f > numel(factors)
        printf("Invalid factor. Keeping existing values.\n");
      else
        new_value = input("Enter new rating from 1 to 5: ");
        if isempty(new_value) || new_value < 1 || new_value > 5
          printf("Invalid rating. Keeping existing value.\n");
        else
          X(p, f) = round(new_value);
          printf("Updated %s - %s to %d.\n", programmes{p}, factors{f}, X(p, f));
        endif
      endif
    endif

    more = input("Adjust another rating? y/n [n]: ", "s");
    keep_editing = strcmpi(more, "y");
  endwhile
endif

% Utility function: V_i = weighted sum of factor ratings.
utilities = X * w;

% Multinomial Logit model: P_i = exp(V_i) / sum_j exp(V_j).
% The max subtraction prevents numerical overflow without changing probabilities.
exp_utilities = exp(utilities - max(utilities));
probabilities = exp_utilities / sum(exp_utilities);
[best_probability, best_index] = max(probabilities);

printf("\nResults\n");
printf("-------\n");
printf("%-18s %-10s %-12s\n", "Programme", "Utility", "Probability");
for i = 1:numel(programmes)
  printf("%-18s %-10.4f %-11.2f%%\n", programmes{i}, utilities(i), probabilities(i) * 100);
endfor

printf("\nPredicted choice: %s (%.2f%%)\n", programmes{best_index}, best_probability * 100);

% Basic visualisation required by the assignment.
figure("name", "Discrete Choice Probability Chart");
bar(probabilities * 100);
set(gca, "xtick", 1:numel(programmes), "xticklabel", programmes);
xtickangle(35);
ylabel("Choice probability (%)");
title("Aiman's Programme Choice Probabilities");
grid on;
