"use strict";

var $ = require('jquery'),
    QuizProgress = require('./quizProgress');

var dom = {
    next: '.quiz .next',
    prev: '.quiz .prev',
    submit: '.quiz .submit',
    warning: '.quiz .active .alert',
    quizSlug: '.quiz[data-quiz-slug]',
    quizInputs: ".quiz input[type!='submit']"
};

var slug = $(dom.quizSlug).data('quiz-slug'),
    progress = new QuizProgress(slug);

function next(e) {
    /*jshint validthis:true */
    var id = +$(this).data('question');
    if (validate(id)) {
        hide(id);
        show(id + 1);
        progress.save();
    }
}

function prev(e) {
    /*jshint validthis:true */
    var id = +$(this).data('question');
    hide(id);
    show(id - 1);
    progress.save();
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
    if (selectedAnswer.size() === 1) {
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
    var state = progress.restore();
    if (state.form) {
        // Restore radio button selections.
        $.each(state.form, function(fieldName, value) {
            // Assumes that only checked values are serialized.
            var radio = $('input[name="' + fieldName + '"][value="' + value + '"]');
            radio.prop('checked', true);
        });
    }
    if (state.question && state.question > 0) {
        hide(0);
        show(state.question);
    }
}

// Save state when radio buttons are checked.
// Note: Be careful not to save progress when clicking the submit button,
// because then there will be no way to distinguish between re-taking a
// quiz and resuming a quiz in-progress.
$(dom.quizInputs).click(function() {
    progress.save();
});

$(dom.next).click(next);
$(dom.prev).click(prev);
$(dom.submit).click(submit);

restore();