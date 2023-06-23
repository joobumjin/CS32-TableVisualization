# Usage Information
To run the backend, navigate to `backend`, then run `./run --gui`.
To begin the React app, navigate to `frontend/kanban/static-kanban`,
then run `npm start`.

# Bugs
I will begin by saying that I hit the 18 hour benchmark. In fact, I
felt lucky to have finished what I did during this fleeting time. 
I did not implement filtering at all, although I built with filtering in mind.
One of the most noticeable bugs is due to some faulty React hook handling.
If you load a database, the Kanban loads fine, for either database. When
you select the other database from the dropdown FOR THE FIRST TIME, it
doesn't load. However, when you switch to the other database (now the original),
it loads the other database instead. For example, say you load potluck.sqlite3 initially.
This will load fine, but then when you select student.sqlite3, the kanban doesn't update.
When you select potluck.sqlite3 again, it now loads the student kanban. I'm 100%
certain that this is not a bug with my table loading, as it works on the first pass,
and I'm certain I'm getting the right table information in the console. The bug
is due to the page not rerendering when I need it to. With that said, I load the data fine
and create *beautiful* kanbans.