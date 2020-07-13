# Review

While all data has been collected in human-readable files (e.g., `.csv` that can be opened with a spreadsheet editor), some cleanup procedures can be performed more efficiently in an automated fashion. The review toolkit offers the following options:

**`purge`**

Will remove all lines in collected data that contain the given text (e.g., you might enter `google` to remove all lines containing `google` -> `https://www.google.com` and a tab titled `Google Calendar` would both be removed).

**`hash-only`**

Will remove all explicit information from all data files (e.g., all URLs and titles will be completely removed). Everything that remains are aggregate statistics and events containing hashes of the relevant tabs, which still allows us to analyze some relationships but effectively prevents us from

**`stats-only`**

Will remove all information except statistical aggregates (e.g., the number of open tabs per window). This is the least useful in terms of scientific analysis but we understand that it might be all you can share at this time.
