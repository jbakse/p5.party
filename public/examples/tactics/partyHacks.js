export function assignRoles(
  guests,
  me,
  roles = [1, 2],
  unassigned = undefined
) {
  // upgrade from undefined to unassigned if specified
  if (unassigned && me.role === undefined) me.role = unassigned;

  // loop through roles and assign them if needed
  roles.forEach((role) => {
    // if there isn't any guest currently in this role...
    if (!guests.find((g) => g.role === role)) {
      // find an unassigned guest...
      const guest = guests.find(
        (g) => g.role === unassigned || g.role === undefined
      );
      // if that unassigned guest is me, take on the role
      if (guest === me) guest.role = role;
    }
  });
}
