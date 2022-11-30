 {groups.map((group) => (
                                <Flex
                                  style={{ marginTop: '16px' }}
                                  alignItems={{ default: 'alignItemsCenter' }}
                                  key={group.name}
                                  className={group.name}
                                >
                                  <FlexItem style={{ minWidth: '200px' }}>
                                    {i18n._(group.label)}
                                  </FlexItem>
                                  <FlexItem grow={{ default: 'grow' }}>
                                    <PermissionChipSelector
                                      availablePermissions={group.object_permissions
                                        .filter(
                                          (perm) =>
                                            !role.permissions.find(
                                              (selected) => selected === perm,
                                            ),
                                        )
                                        .map((value) =>
                                          twoWayMapper(
                                            value,
                                            filteredPermissions,
                                          ),
                                        )
                                        .sort()}
                                      selectedPermissions={role.permissions
                                        .filter((selected) =>
                                          group.object_permissions.find(
                                            (perm) => selected === perm,
                                          ),
                                        )
                                        .map((value) =>
                                          twoWayMapper(
                                            value,
                                            filteredPermissions,
                                          ),
                                        )}
                                      menuAppendTo='inline'
                                      multilingual={true}
                                      isViewOnly={true}
                                    />
                                  </FlexItem>
                                </Flex>
                              ))}