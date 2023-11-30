// Custom Loader Element Node
var loader = document.createElement('div')
loader.setAttribute('id', 'pre-loader');
loader.innerHTML = "<div class='lds-hourglass'></div>";

// Loader Start Function
window.start_loader = function() 
{
    if (!document.getElementById('pre-loader') || (!!document.getElementById('pre-loader') && document.getElementById('pre-loader').length <= 0))
        document.querySelector('body').appendChild(loader)
}

// Loader Stop Function
window.end_loader = function() 
{
    if (!!document.getElementById('pre-loader')) 
    {
        setTimeout(() => 
        {
            document.getElementById('pre-loader').remove()
        }, 500)
    }
}
var recipes = !!localStorage.getItem('recipes') ? $.parseJSON(localStorage.getItem('recipes')) : {}
var rec_arr = {}

function load_list($renew = false) {
    if ($renew)
        recipes = !!localStorage.getItem('recipes') ? $.parseJSON(localStorage.getItem('recipes')) : {}
    $('#recipe-list').html('')
    if (Object.keys(recipes).length > 0) {
        Object.keys(recipes).map(k => {
            rec_arr[recipes[k].id] = recipes[k]
            var data = recipes[k]
            var ritem = $($('noscript#recipe-item-clone').html()).clone()
            ritem.attr('data-id', data.id)
            ritem.find('.recipe-title').text(data.recipe)
            ritem.find('.recipe-description').text(data.description)
            ing_count = Object.keys(data.ingredients).length
            ing_checked = 0
            Object.keys(data.ingredients).map(i => {
                if (data.ingredients[i].is_checked)
                    ing_checked++;
            })
            ritem.find('.ing-status').text("Ingredient(s): " + ing_checked + " out of " + ing_count)
            ritem.find('.view-data, .edit-data, .delete-data').attr('data-id', data.id)
            $('#recipe-list').append(ritem)
            ritem.find('.delete-data').click(function() {
                var conf = confirm("Are you sure to delete this Recipe?")
                var id = $(this).attr('data-id')
                if (conf == true)
                    delete_recipe(id)
            })
            ritem.find('.edit-data').click(function() {
                var form = $('#recipe-form')
                $('#form-title').text("Update Recipe Details")
                form.find('[name="id"]').val(data.id)
                form.find('[name="name"]').val(data.recipe)
                form.find('[name="description"]').val(data.description)
                Object.keys(data.ingredients).map(i => {
                    var item = $($('noscript#ing-clone').html()).clone()
                    var queue = i;
                    item.attr('data-queue', queue)
                    item.find('[name="ingredient[]"]').attr("name", "ingredient[" + queue + "]").val(data.ingredients[i].ingredient)
                    item.find('[name="ingredient_checked[]"]').attr("name", "ingredient_checked[" + queue + "]").attr("id", "ingredient_" + queue)
                    if (data.ingredients[i].is_checked)
                        item.find('[name="ingredient_checked[' + queue + ']"]').prop('checked', true)
                    item.find('.ing-check').attr('for', "ingredient_" + queue)
                    item.find('.ingredient-name').text(data.ingredients[i].ingredient)
                    console.log(item[0])
                    $('#ingredient-list').append(item)
                    item.find('.del-ingredient').click(function() {
                        item.remove()
                    })
                })
                $('#recipe-form-holder').show('slideDown')
                $('#recipe-list-holder').hide('slideDown')
            })
            ritem.find('.view-data').click(function() {
                var viewModal = $('#viewModal')
                var description = data.description.replace(/\n/gi, "<br/>")
                viewModal.find('#modal-recipe-name').text(data.recipe)
                viewModal.find('#modal-recipe-description').html(description)
                viewModal.find('#modal-ingredients').html('')
                Object.keys(data.ingredients).map(i => {
                    var li = $('<li class="list-group-item">')
                    li.html((data.ingredients[i].is_checked ? "<span class='me-2'><span class='fa fa-check text-primary'></span></span>" : "<span class='ms-4'></span>") + data.ingredients[i].ingredient)
                    viewModal.find('#modal-ingredients').append(li)
                })
                viewModal.modal('show')
            })
        })
    }
    $('#search').trigger('input')
}

function delete_recipe($id) {
    start_loader()
    if (!!rec_arr[$id])
        delete rec_arr[$id];
    var new_data = {}
    new_data = Object.keys(rec_arr).map(k => { return rec_arr[k] });
    localStorage.setItem('recipes', JSON.stringify(new_data))
    load_list(true)
    end_loader()
}
$(function() {
    $('body').height($(window).height())
    load_list()
    end_loader()
    $('#add_recipe').click(function() {
        $('#recipe-form-holder').show('slideDown')
        $('#recipe-list-holder').hide('slideDown')
    })
    $('#cancel-form').click(function() {
        $('#recipe-form-holder').hide('slideUp')
        $('#recipe-list-holder').show('slideUp')
        $('#recipe-form')[0].reset()
        $('#ingredient-list').html('')
        $('#form-title').text("Add New Recipe")
        $('[name="id"]').val('')
    })

    $('#new_ingredient').click(function() {
        var ingredient = $('#ingredient-txtfield').val()
        if (ingredient == '') {
            $('#ingredient-txtfield').focus()
        } else {
            var item = $($('noscript#ing-clone').html()).clone()
            var queue = $('#ingredient-list .ingredient-item').length > 0 ? parseInt($('#ingredient-list .ingredient-item').last().attr('data-queue')) + 1 : 0;
            item.attr('data-queue', queue)
            item.find('[name="ingredient[]"]').attr("name", "ingredient[" + queue + "]").val(ingredient)
            item.find('[name="ingredient_checked[]"]').attr("name", "ingredient_checked[" + queue + "]").attr("id", "ingredient_" + queue)
            item.find('.ing-check').attr('for', "ingredient_" + queue)
            item.find('.ingredient-name').text(ingredient)
            console.log(item[0])
            $('#ingredient-list').append(item)
            item.find('.del-ingredient').click(function() {
                item.remove()
            })
            $('#ingredient-txtfield').val('').focus()
        }
    })
    $('#recipe-form').submit(function(e) {
        e.preventDefault()
        start_loader()
        var id = $('[name="id"]').val()
        if (id == '') {
            while (true) {
                id = Math.floor(Math.random() * 999999999999)
                console.log(id)
                if (!rec_arr[id])
                    break;
            }
        }
        var new_data = {}
        var ings = [];
        $('#ingredient-list .ingredient-item').each(function() {
            ings.push({
                ingredient: $(this).find('.ingredient-name').val(),
                is_checked: $(this).find('.ingredient-check').is(':checked')
            })
        })
        rec_arr[id] = {
            id: id,
            recipe: $('[name="name"]').val(),
            description: $('[name="description"]').val(),
            ingredients: ings
        }
        new_data = Object.keys(rec_arr).map(k => { return rec_arr[k] });
        localStorage.setItem('recipes', JSON.stringify(new_data))
        end_loader()
        alert("Recipe Successfully Saved.")
        $(this)[0].reset()
        load_list(true)
        $('#cancel-form').trigger('click')
    })
    $('#search').on('input', function() 
    {
        var find = $(this).val().toLowerCase()
        console.log(find)
        $('#recipe-list .list-group-item').each(function() {
            var txt = $(this).text().toLowerCase()
            if (txt.includes(find) == true) {
                $(this).toggle(true)
            } else {
                $(this).toggle(false)
            }
        })
    })
})