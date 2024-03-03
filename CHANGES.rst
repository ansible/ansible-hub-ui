4.6.6 (2023-05-26)
==================

No significant changes.


----


4.6.5 (2023-04-20)
==================

Bugfixes
--------

- Repair list of collection dependencies - add namespace to the link caption.
  `AAH-1807 <https://issues.redhat.com/browse/AAH-1807>`_
- Repair error mesages in EE form.
  `AAH-1845 <https://issues.redhat.com/browse/AAH-1845>`_
- Fix podman pull URLs when latest tag not present, fix digest urls
  `AAH-1988 <https://issues.redhat.com/browse/AAH-1988>`_
- Show container signing button based only on container_signing, not collection_signing
  `AAH-2013 <https://issues.redhat.com/browse/AAH-2013>`_
- Show container signature badge based only on container_signing, not collection_signing
  `AAH-2015 <https://issues.redhat.com/browse/AAH-2015>`_
- License fields on AH - blank or formatted incorrectly - Add comma separator between licences. And also hide license field when empty.
  `AAH-2048 <https://issues.redhat.com/browse/AAH-2048>`_


----


4.6.4 (2023-04-04)
==================

Features
--------

- Display boolean values in docs as true/false (was yes/no)
  `AAH-1859 <https://issues.redhat.com/browse/AAH-1859>`_


Bugfixes
--------

- Fix a bug where the UI was falsely reporting that collection dependencies don't exist.
  `AAH-2018 <https://issues.redhat.com/browse/AAH-2018>`_
- Fix bug where the resource type on "reserved resources" on the task management page always returns "api".
  `AAH-2055 <https://issues.redhat.com/browse/AAH-2055>`_


----


4.6.3 (2022-12-05)
==================

No significant changes.


----


4.6.2 (2022-10-21)
==================

No significant changes.


----


4.6.1 (2022-10-14)
==================

No significant changes.


----


4.6.0 (2022-10-13)
==================

Bugfixes
--------

- Added search ahead in namespace selection in imports.
  `AAH-1725 <https://issues.redhat.com/browse/AAH-1725>`_
- Owners tab - go up to group list when clicking the tab
  `AAH-1733 <https://issues.redhat.com/browse/AAH-1733>`_
- Moved to the *owners tab only clickable when already created
  `AAH-1792 <https://issues.redhat.com/browse/AAH-1792>`_


Misc
----

- `AAH-618 <https://issues.redhat.com/browse/AAH-618>`_


Features
--------

- Create new UI for object permission assignment
  `AAH-1129 <https://issues.redhat.com/browse/AAH-1129>`_
- Implement roles list and create role UI pages.
  `AAH-1131 <https://issues.redhat.com/browse/AAH-1131>`_
- Added detailed information to the sign all modal
  `AAH-1313 <https://issues.redhat.com/browse/AAH-1313>`_
- Add signature upload elements for Insights mode. Change the Sign buttons when upload certificate enabled
  `AAH-1369 <https://issues.redhat.com/browse/AAH-1369>`_
- Show the proper MINIMUM PASSWORD LENGTH in UI
  `AAH-1573 <https://issues.redhat.com/browse/AAH-1573>`_
- Create blue info alert at start of setDeprecation task.
  `AAH-1601 <https://issues.redhat.com/browse/AAH-1601>`_
- Add download icon to the aproval page.
  `AAH-1621 <https://issues.redhat.com/browse/AAH-1621>`_
- Localize collection modules/roles/... counter
  `AAH-1684 <https://issues.redhat.com/browse/AAH-1684>`_
- Surfacing feature misconfiguration alert messages.
  `AAH-1739 <https://issues.redhat.com/browse/AAH-1739>`_
- Users without `core.view_task` permission get alert notification.
  `AAH-1803 <https://issues.redhat.com/browse/AAH-1803>`_
- Expose signing service public keys
  `AAH-1826 <https://issues.redhat.com/browse/AAH-1826>`_
- Add validated content repo.
  `AAH-1943 <https://issues.redhat.com/browse/AAH-1943>`_


Bugfixes
--------

- Repaired - Do not use global active CSS selector in sort table headers
  `AAH-1546 <https://issues.redhat.com/browse/AAH-1546>`_
- Wait for setDeprecation task before running loadCollections and success handler.
  `AAH-1596 <https://issues.redhat.com/browse/AAH-1596>`_
- Fix not showing roles and optimize roles fetching on group access page
  `AAH-1600 <https://issues.redhat.com/browse/AAH-1600>`_
- Remove filter startswith and set content_object to null
  `AAH-1602 <https://issues.redhat.com/browse/AAH-1602>`_
- Rename `Repo URL` to `Distribution URL` in repo management list view.
  `AAH-1610 <https://issues.redhat.com/browse/AAH-1610>`_
- Update the flag for enabling collection upload
  `AAH-1622 <https://issues.redhat.com/browse/AAH-1622>`_
- Fixing the certification upload error surfacing.
  `AAH-1623 <https://issues.redhat.com/browse/AAH-1623>`_
- Edit group permissions - correctly hide user/group-related permissions in keycloak mode
  `AAH-1688 <https://issues.redhat.com/browse/AAH-1688>`_
- Fix success alert after signature upload failure
  `AAH-1769 <https://issues.redhat.com/browse/AAH-1769>`_
- Group list: filter by name__icontains, not name exact
  `AAH-1806 <https://issues.redhat.com/browse/AAH-1806>`_
- Fixed group filter - added icontains to name parameter.
  `AAH-1846 <https://issues.redhat.com/browse/AAH-1846>`_
- Ensure sorting, filtering, and resetting filters resets to page 1
  `AAH-1848 <https://issues.redhat.com/browse/AAH-1848>`_
- Fix Owners tab permissions
  `AAH-1875 <https://issues.redhat.com/browse/AAH-1875>`_
- EE list: filter by name__icontains, not name exact
  `AAH-1913 <https://issues.redhat.com/browse/AAH-1913>`_


Misc
----

- `AAH-518 <https://issues.redhat.com/browse/AAH-518>`_, `AAH-625 <https://issues.redhat.com/browse/AAH-625>`_, `AAH-626 <https://issues.redhat.com/browse/AAH-626>`_, `AAH-628 <https://issues.redhat.com/browse/AAH-628>`_, `AAH-1025 <https://issues.redhat.com/browse/AAH-1025>`_, `AAH-1104 <https://issues.redhat.com/browse/AAH-1104>`_, `AAH-1130 <https://issues.redhat.com/browse/AAH-1130>`_, `AAH-1192 <https://issues.redhat.com/browse/AAH-1192>`_, `AAH-1262 <https://issues.redhat.com/browse/AAH-1262>`_, `AAH-1265 <https://issues.redhat.com/browse/AAH-1265>`_, `AAH-1332 <https://issues.redhat.com/browse/AAH-1332>`_, `AAH-1428 <https://issues.redhat.com/browse/AAH-1428>`_, `AAH-1552 <https://issues.redhat.com/browse/AAH-1552>`_, `AAH-1553 <https://issues.redhat.com/browse/AAH-1553>`_, `AAH-1574 <https://issues.redhat.com/browse/AAH-1574>`_, `AAH-1575 <https://issues.redhat.com/browse/AAH-1575>`_, `AAH-1578 <https://issues.redhat.com/browse/AAH-1578>`_, `AAH-1591 <https://issues.redhat.com/browse/AAH-1591>`_, `AAH-1598 <https://issues.redhat.com/browse/AAH-1598>`_, `AAH-1599 <https://issues.redhat.com/browse/AAH-1599>`_, `AAH-1616 <https://issues.redhat.com/browse/AAH-1616>`_, `AAH-1641 <https://issues.redhat.com/browse/AAH-1641>`_, `AAH-1654 <https://issues.redhat.com/browse/AAH-1654>`_, `AAH-1677 <https://issues.redhat.com/browse/AAH-1677>`_, `AAH-1678 <https://issues.redhat.com/browse/AAH-1678>`_, `AAH-1694 <https://issues.redhat.com/browse/AAH-1694>`_, `AAH-1695 <https://issues.redhat.com/browse/AAH-1695>`_, `AAH-1696 <https://issues.redhat.com/browse/AAH-1696>`_, `AAH-1698 <https://issues.redhat.com/browse/AAH-1698>`_, `AAH-1710 <https://issues.redhat.com/browse/AAH-1710>`_, `AAH-1800 <https://issues.redhat.com/browse/AAH-1800>`_, `AAH-1818 <https://issues.redhat.com/browse/AAH-1818>`_, `AAH-1852 <https://issues.redhat.com/browse/AAH-1852>`_, `AAH-1858 <https://issues.redhat.com/browse/AAH-1858>`_, `AAH-1878 <https://issues.redhat.com/browse/AAH-1878>`_, `AAH-1926 <https://issues.redhat.com/browse/AAH-1926>`_


----
