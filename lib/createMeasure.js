var logger = require('./logger');


var createMeasure = {
    createMeasure: function(appRef, app, data, tags) {
        var objId = data[9].qText;
        var object = meas(data, tags);
        return app.getMeasure(objId)
            .then(function(meas) {
                if (meas == null) {
                    logger.debug("Measure: " + objId + " does not exist.  Creating", { module: "createMeasure", app: appRef.name });
                    return app.createMeasure(object)
                        .then(function(newMeas) {
                            logger.debug("Measure: " + objId + " Created", { module: "createMeasure", app: appRef.name });

                            return newMeas.getLayout()
                                .then(function(layout) {
                                    return "CREATED";
                                    //return layout.qInfo.qId;
                                })
                        })
                } else {
                    return meas.getProperties()
                        .then(function(currentProps) {
                            logger.debug("Measure: " + objId + " exists.  Checking for changes.", { module: "createMeasure", app: appRef.name });
                            if (JSON.stringify(currentProps) == JSON.stringify(object)) {
                                logger.debug("Measure: " + objId + " no changes found.", { module: "createMeasure", app: appRef.name });
                                return "SAME";
                            } else {
                                logger.debug("Measure: " + objId + " found changes.  Setting properties.", { module: "createMeasure", app: appRef.name });
                                return meas.setProperties(object)
                                    .then(function() {
                                        logger.debug("Measure: " + objId + " new properties set.", { module: "createMeasure", app: appRef.name });
                                        return meas.getLayout()
                                            .then(function(layout) {
                                                return "UPDATED"
                                                    //return layout.qInfo.qId;
                                            });
                                    });
                            }
                        });
                }
            });
    }
};

module.exports = createMeasure;

function meas(data, tags) {
    var meas = {
        qInfo: {
            qId: data[9].qText,
            qType: data[1].qText.toLowerCase()
        },
        qMeasure: {
            qLabel: data[2].qText,
            qDef: data[6].qText,
            qGrouping: "N",
            qExpressions: [],
            qActiveExpression: 0
        },
        qMetaDef: {
            title: data[2].qText,
            description: data[5].qText == "" ? data[2].qText : data[5].qText,
            qSize: -1,
            sourceObject: "",
            draftObject: "",
            tags: tags,
            gms: true
        }
    };

    if (data[10].qText !== undefined) {
        if (data[10].qText !== '' || data[10].qText !== null || data[10].qText !== '-') {
            meas.qMeasure.baseColor = { color: data[10].qText, index: -1 };
        }
    }

    return meas;
}