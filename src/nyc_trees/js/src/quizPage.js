"use strict";

var $ = require('jquery'),
    util = require('./lib/util'),
    SavedState = require('./lib/SavedState');

var dom = {
    next: '.quiz .next',
    prev: '.quiz .prev',
    submit: '.quiz .submit',
    warning: '.quiz .active .alert',
    quizSlug: '.quiz[data-quiz-slug]',
    quizInputs: ".quiz input[type!='submit']",
    selections: '.quiz input:checked',
    activeQuestion: '.quiz .active.question'
};

var slug = $(dom.quizSlug).data('quiz-slug'),
    progress = new SavedState({
        key: 'quiz-progress-' + slug,
        validate: function(state) {
            if (util.isNullOrUndefined(state)) {
                throw new Error('Unable to parse serialized state');
            }
            if (util.isNullOrUndefined(state.form)) {
                throw new Error('Expected `state.form` to exist');
            }
            if (!$.isNumeric(state.question)) {
                throw new Error('Expected `state.question` to be numeric');
            }
        }
    });

function getState() {
    var formData = {};
    $(dom.selections).each(function() {
        var key = $(this).attr('name');
        if (!formData[key]) {
            formData[key] = [];
        }
        formData[key].push($(this).val());
    });
    return {
        form: formData,
        question: $(dom.activeQuestion).data('question')
    };
}

function next(e) {
    /*jshint validthis:true */
    var id = +$(this).data('question');
    if (validate(id)) {
        hide(id);
        show(id + 1);
        progress.save(getState());
    }
}

function prev(e) {
    /*jshint validthis:true */
    var id = +$(this).data('question');
    hide(id);
    show(id - 1);
    progress.save(getState());
}

function submit(e) {
    /*jshint validthis:true */
    var id = +$(this).data('question');
    if (!validate(id)) {
        e.preventDefault();
        return;
    }
    progress.clear();
}

// Return true if there is 1 checked answer for given question.
function validate(id) {
    var selectedAnswer = $('[name="question.' + id + '"]:checked');
    if (selectedAnswer.size() >= 1) {
        $(dom.warning).addClass('hidden');
        return true;
    }
    $(dom.warning).removeClass('hidden');
    return false;
}

function hide(id) {
    $('[data-question=' + id + ']').addClass('hidden');
    $('[data-question=' + id + ']').removeClass('active');
}

function show(id) {
    $('[data-question=' + id + ']').removeClass('hidden');
    $('[data-question=' + id + ']').addClass('active');
}

function restore() {
    var state = progress.load();
    if (state && state.form) {
        // Restore radio button selections.
        $.each(state.form, function(fieldName, values) {
            $.each(values, function(__, value) {
                var field = $('input[name="' + fieldName + '"][value="' + value + '"]');
                field.prop('checked', true);
            });
        });
    }
    if (state && state.question > 0) {
        hide(0);
        show(state.question);
    }
}

// Save state when radio buttons are checked.
// Note: Be careful not to save progress when clicking the submit button,
// because then there will be no way to distinguish between re-taking a
// quiz and resuming a quiz in-progress.
$(dom.quizInputs).click(function() {
    progress.save(getState());
});

$(dom.next).click(next);
$(dom.prev).click(prev);
$(dom.submit).click(submit);

restore();
