# Group gift contribution access

`fix-contribution-recursion.sql` replaces the recursive contribution SELECT policy. A narrowly scoped security-definer function checks whether the current authenticated user contributed to a gift without recursively evaluating the same row policy. It uses a fixed empty search path, fully qualified database objects and only accepts the gift ID; access is limited to authenticated users. The policy retains the existing behavior: contributors can view their own contributions and other contributors' entries for the same gift, while the list owner and unrelated users cannot read them. Anonymous queries return no rows. Message access continues to use the contribution policy.

Apply the migration in a transaction after a database backup. Verify both database role access and the anonymous REST endpoint. Existing gift contribution policies in `database-schema.sql` use the same nonrecursive approach for fresh setups.
