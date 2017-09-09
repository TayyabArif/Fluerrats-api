'use strict'

module.exports = function (sequelize, DataTypes) {
  let UserGroups = sequelize.define('UserGroups', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    GroupId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DataTypes.STRING
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    }
  })

  return UserGroups
}
