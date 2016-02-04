
module.exports = function(model, pAdminRequired, pModelName) {

    var Model = model,
        adminRequired = pAdminRequired,
        modelName = pModelName;

    var updateModel = function(data, model) {
        for (var key in data) {
            model[key] = data[key];
        }
    };

    var saveModel = function(model) {
        model.save(function (err) {
            if (err)  {
                throw err;
            }
        });
    };

    var hasPermissions = function(req, adminRequired) {
        return (!adminRequired || req.user.isManagingUser());
    };

    return {

        getAll: function(req, res) {
            if (hasPermissions(req, adminRequired)) {
                Model.find({}, function(err, models) {
                    res.json(models);
                });
            } else {
                res.json([]);
            }
        },
        saveAll: function(req, res) {

            if (hasPermissions(req, adminRequired)) {

                Model.find({}, function(err, models) {

                    var updatedModels = req.body[modelName];

                    // run on all models in request and search in db models
                    for (var modelIndex = 0; modelIndex < updatedModels.length; modelIndex++) {

                        var model = null;

                        for (var i = 0; i < models.length; i++) {
                            if (updatedModels[modelIndex]._id == models[i]._id) {
                                model = models[i];
                                break;
                            }
                        }

                        if (!model) {
                            model = new Model();
                        }

                        updateModel(updatedModels[modelIndex], model);
                        saveModel(model);
                    }

                    // run on all models in db and check if they need to be deleted
                    for (var modelIndex = 0; modelIndex < models.length; modelIndex++) {
                        var model = null;

                        for (var i = 0; i < updatedModels.length; i++) {
                            if (models[modelIndex]._id == updatedModels[i]._id) {
                                model = models[modelIndex];
                                break;
                            }
                        }

                        if (!model) {
                            models[modelIndex].remove();
                        }
                    }

                    res.json({status: 'success'});
                });
            } else {
                res.json({status: 'failure'});
            }
        }
    }
}
