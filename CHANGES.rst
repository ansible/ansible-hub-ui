4.6.0 (2022-10-13)
Bugfixes
--------

- Owners tab - go up to group list when clicking the tab
  `AAH-1733 <https://issues.redhat.com/browse/AAH-1733>`_
- Moved to the *owners tab only clickable when already created
  `AAH-1792 <https://issues.redhat.com/browse/AAH-1792>`_


Misc
----

- `AAH-618 <https://issues.redhat.com/browse/AAH-618>`_


----


4.6.0 (2022-10-13)
No significant changes.


----


4.6.0 (2022-10-13)
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


4.5.0 (2022-05-04)
==================

Features
--------

- Implement edit group from group list view
  `AAH-829 <https://issues.redhat.com/browse/AAH-829>`_
- Create a changelog for the UI.
  `AAH-1228 <https://issues.redhat.com/browse/AAH-1228>`_
- Unify success alerts and create new ones if not yet implemented.
  `AAH-1236 <https://issues.redhat.com/browse/AAH-1236>`_
- Unify fail alerts notifications across the application.
  `AAH-1354 <https://issues.redhat.com/browse/AAH-1354>`_
- Makes visible the delete alert upon deletion and redirect from ex env detail page.
  `AAH-1383 <https://issues.redhat.com/browse/AAH-1383>`_
- Create separate component for toggle dropdown on list views
  `AAH-1427 <https://issues.redhat.com/browse/AAH-1427>`_


Bugfixes
--------

- Fix "Publish container images" documentation link version - 2.0-ea -> 2.1
  `AAH-1364 <https://issues.redhat.com/browse/AAH-1364>`_
- Insights token page - user.username -> cloud-services in the curl command
  `AAH-1376 <https://issues.redhat.com/browse/AAH-1376>`_
- NamespaceList: Clear filter text when clearing all filters
  `AAH-1382 <https://issues.redhat.com/browse/AAH-1382>`_
- Fixed insights mode redirect when deleting a namespace
  `AAH-1461 <https://issues.redhat.com/browse/AAH-1461>`_
- Fix an error where images created by ansible builder couldn't be inspected in the UI.
  `AAH-1527 <https://issues.redhat.com/browse/AAH-1527>`_


Misc
----

- `AAH-149 <https://issues.redhat.com/browse/AAH-149>`_, `AAH-396 <https://issues.redhat.com/browse/AAH-396>`_, `AAH-624 <https://issues.redhat.com/browse/AAH-624>`_, `AAH-628 <https://issues.redhat.com/browse/AAH-628>`_, `AAH-635 <https://issues.redhat.com/browse/AAH-635>`_, `AAH-820 <https://issues.redhat.com/browse/AAH-820>`_, `AAH-822 <https://issues.redhat.com/browse/AAH-822>`_, `AAH-832 <https://issues.redhat.com/browse/AAH-832>`_, `AAH-968 <https://issues.redhat.com/browse/AAH-968>`_, `AAH-1000 <https://issues.redhat.com/browse/AAH-1000>`_, `AAH-1059 <https://issues.redhat.com/browse/AAH-1059>`_, `AAH-1060 <https://issues.redhat.com/browse/AAH-1060>`_, `AAH-1061 <https://issues.redhat.com/browse/AAH-1061>`_, `AAH-1062 <https://issues.redhat.com/browse/AAH-1062>`_, `AAH-1069 <https://issues.redhat.com/browse/AAH-1069>`_, `AAH-1070 <https://issues.redhat.com/browse/AAH-1070>`_, `AAH-1072 <https://issues.redhat.com/browse/AAH-1072>`_, `AAH-1088 <https://issues.redhat.com/browse/AAH-1088>`_, `AAH-1106 <https://issues.redhat.com/browse/AAH-1106>`_, `AAH-1111 <https://issues.redhat.com/browse/AAH-1111>`_, `AAH-1189 <https://issues.redhat.com/browse/AAH-1189>`_, `AAH-1195 <https://issues.redhat.com/browse/AAH-1195>`_, `AAH-1198 <https://issues.redhat.com/browse/AAH-1198>`_, `AAH-1199 <https://issues.redhat.com/browse/AAH-1199>`_, `AAH-1204 <https://issues.redhat.com/browse/AAH-1204>`_, `AAH-1205 <https://issues.redhat.com/browse/AAH-1205>`_, `AAH-1207 <https://issues.redhat.com/browse/AAH-1207>`_, `AAH-1235 <https://issues.redhat.com/browse/AAH-1235>`_, `AAH-1245 <https://issues.redhat.com/browse/AAH-1245>`_, `AAH-1253 <https://issues.redhat.com/browse/AAH-1253>`_, `AAH-1264 <https://issues.redhat.com/browse/AAH-1264>`_, `AAH-1273 <https://issues.redhat.com/browse/AAH-1273>`_, `AAH-1282 <https://issues.redhat.com/browse/AAH-1282>`_, `AAH-1333 <https://issues.redhat.com/browse/AAH-1333>`_, `AAH-1357 <https://issues.redhat.com/browse/AAH-1357>`_, `AAH-1410 <https://issues.redhat.com/browse/AAH-1410>`_, `AAH-1432 <https://issues.redhat.com/browse/AAH-1432>`_, `AAH-1439 <https://issues.redhat.com/browse/AAH-1439>`_


----
