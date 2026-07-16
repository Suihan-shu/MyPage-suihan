---
layout: post
title: "Numerical Analysis Series: 0-Introduction"
date: 2026-02-10 16:00:00 +0800
categories: [Mathematics, Numerical Analysis]
tags: [numerical-analysis, intro, math]
series_key: numerical-analysis
series_order: 0
lang: en
lang-ref: numerical-analysis-0
description: "Introduction to the Numerical Analysis series: The What, Why, and How. Why mastering the underlying theory matters even in the AI era."
toc:
  sidebar: left
---

# 0-Introduction

Numerical Analysis (often referred to as "Computational Methods" in engineering undergraduate courses) is a subject I have gained a deeper appreciation for after studying it systematically during both my undergraduate and graduate studies. I am compiling these thoughts into a blog series, hoping to provide some help to future learners.

This series is primarily based on **Professor Lei Wu's course MAE5002 Advanced Numerical Analysis at YOUR_INSTITUTION**. I gained a lot from his classes and lecture notes. I also benefited from the solid foundation laid by Professor Qi Li from YOUR_INSTITUTION during my undergraduate studies. After taking Numerical Analysis again as a graduate student, I finally had a moment of enlightenment. I would like to express my sincere gratitude to both teachers.

As my knowledge is limited, these articles are mainly for recording my own thoughts and outputs. There may be errors or lack of rigor, so please bear with me and I plan to correct them!

---

## What? Why? How?

I think when you are learning a new course, you should ask yourself three questions, simply put: **What? Why? How?**

*   **What?** What is this course about?
*   **Why?** Why do we need to learn it?
*   **How?** How can I use it after learning?

Learning with questions allows you to grasp the core of the course more accurately, avoiding the confusion of "feeling meaningless after learning". During the learning process, your perception of these three questions will gradually deepen, which is actually a manifestation of your deepening mastery of the course.

We cannot expect to get the essence right from the start, but it is this process of continuous optimization and iterative cognition that deepens understanding. **This is the essence of learning; do not learn just for the sake of learning.**

### What is Numerical Analysis?

During my undergraduate studies, I realized: **Numerical Analysis is actually studying how to make computers understand real physical problems and solve them.**

For humans, we tend to prefer **analytical solutions**. For example, a quadratic equation has a root-finding formula, which is its analytical solution. But if you were asked to find the numerical solution of a complex equation (such as the root of $x^5 + x + 1 = 0$), you might not know where to start.

Computers are different from humans. It might be very difficult for them to derive analytical solutions, but they are extremely good at massive calculations. Therefore, I thought at the time that "Computational Methods" was about teaching computers how to calculate numerical solutions of equations (especially differential equations). Although this view seems a bit simple in retrospect, it was enough for a beginner to establish this cognition.

In my subsequent studies, my strategy was to **practice programming more**. Being able to write the program shows that you have a relatively solid grasp of the relevant algorithm logic. **You really have to understand it, not just memorize it.**

However, in my undergraduate studies, I focused mainly on the algorithms themselves and ignored many derivation processes. Although I thought I understood it well at the time, after retaking the course in graduate school, I found that simply staying at the "algorithm" level without digging into the mathematical connections between different parts caused me to fail to grasp the thread running through them, even though I knew Numerical Analysis had different sections.

**Ignoring the derivation process means ignoring the source of the algorithm, making it difficult to dig deep or modify it, and losing the space for deep thinking.** This also reminds everyone not to be satisfied with just knowing how to use it.

### Linear Systems

Many disciplines are essentially explaining the physical world. Based on various physical laws, we obtain a series of equations.

Most systems we encounter in high school are idealized and simplified models. But **the real physical world is often described by differential equations** (such as Fourier's Law of Heat Conduction). Let's look at it from simple to complex:

From the simplest linear equation in one variable (describing the motion of a ball in the x-direction) to linear equations in two variables. Solving them manually is simple. But for computers? You can't manually adjust the code for every equation form. What if the equation has 1000 unknowns? Writing 1000 layers of for-loops is obviously neither elegant nor realistic.

To be concise and elegant, we need to establish a **processing paradigm**. No matter how many unknowns the equation has, it can be solved in the same way. Smart readers may have thought of it—**Linear Algebra**. We can write the equations in matrix form $Ax=b$ and solve them uniformly using linear algebra methods.

After establishing this paradigm, solving is no longer a problem, but in engineering, **computation volume and efficiency** become key.
Real-world simulations (such as Finite Element Analysis) often involve millions of nodes, forming huge systems of equations. If an algorithm can reduce calculation time by half, in today's expensive computing power era (students in AI know this well), the value is immense. Therefore, **how to improve the solution efficiency of linear systems is a deep-water zone in Numerical Analysis.**

### Non-linear Equations

In the real world, gravity and electromagnetic forces are inverse square forces, and trajectories are ellipses, parabolas... these are all non-linear.

*   **Quadratic equations**: Have root formulas.
*   **Cubic equations**: Also have root formulas (Cardano's formula), as shown below, but it is long and smelly, and simply impossible to memorize:

$$
\begin{aligned}
&ax^3+bx^2+cx+d=0 \quad (a\neq 0)\\[6pt]
&\Delta_0=b^2-3ac,\qquad
\Delta_1=2b^3-9abc+27a^2d\\[6pt]
&C=\sqrt[3]{\frac{\Delta_1+\sqrt{\Delta_1^2-4\Delta_0^3}}{2}},\qquad
\omega=\frac{-1+i\sqrt{3}}{2}\\[6pt]
&x_k=-\frac{1}{3a}
\left(
b+\omega^k C+\frac{\Delta_0}{\omega^k C}
\right),
\quad k=0,1,2
\end{aligned}
$$

*   **Equations of degree five and above**: Abel proved long ago that there is generally no radical solution.

Since general analytical solutions are not possible, computers need to use **numerical iteration** (such as Bisection Method, Newton's Method). This constitutes an important section of **Non-linear Equation Solving** in Numerical Analysis. Similarly, discussions on computational efficiency and convergence speed are involved here.

### Interpolation & Fitting

Students familiar with computers know that computers cannot store true "continuous" values; they can only save discrete points.

**Interpolation** is a method of inferring new data points within a range from known discrete points.
For example: You have three discrete points and want to know the value between them.
*   If you connect adjacent points directly (Linear Interpolation), although simple, it is not smooth at the connection and not precise enough.
*   If we use a quadratic function to pass through these three points, we can get a smooth curve, thereby describing the trend more accurately.

This is the core of interpolation: finding a function to accurately describe these points. This is crucial in signal processing and image reconstruction.

Here we must distinguish **Fitting**: Interpolation requires the function to pass through every known point; while Fitting only seeks a function to **approximately** describe the overall trend of the data (such as Least Squares), allowing for errors.

### Numerical Calculus

We've talked about ideal equations, now back to differential equations. How do computers do calculus?

Calculus theory is "continuous". But in numerical methods, we need to **discretize** it, which is **Numerical Differentiation** and **Numerical Integration**.
Recall the definition of calculus:
*   Differentiation is defined from slope (limit).
*   Integration is defined from the area under the curve (Riemann sum).

In Numerical Analysis, we use difference to replace differentiation, and rectangle/trapezoid area sum to replace integration. Interpolation ideas are often used here as well, deriving differentiation or integration formulas by constructing interpolation polynomials. Finally, combining these tools allows us to solve complex **Differential Equations**.

---

## Conclusion

The above is the preliminary picture I hope everyone can establish. **The various sections of Numerical Analysis (Linear Algebra, Non-linear Equations, Interpolation, Calculus) are not isolated, but closely connected toolkits.**

In the AI era, you might feel: "AI can write code now, do I still need to learn these theories?"
My answer is: **Absolutely.**

AI can write good code, but the premise is that **your Prompt logic is clear and your requirement description is accurate**. This requires you to master the underlying theories. If you only have a smattering of knowledge about the theory, it is difficult to direct AI to generate correct results, or to know how to Debug when the results are wrong.

AI is not omnipotent. Currently, it can only function within existing knowledge bases. Facing a brand new complex engineering problem, **a clear theoretical framework + accurate problem description** is the key to making AI perform at its best.

This is my shallow understanding. If the Numerical Analysis series blog can be rewarding for some people, it will be very meaningful. I hope everyone maintains critical thinking, does not accept blog content completely, but internalizes it into their own knowledge.
