import { mount } from '@vue/test-utils';
import Rx from 'rx';
import ImageMapper from '../components/ImageMapper.vue';

const createHelper = (wrapper) => ({
  addRect() {
    wrapper.find('.image-map-controls__button--add-rect').trigger('click');
  },

  addCircle() {
    wrapper.find('.image-map-controls__button--add-circle').trigger('click');
  },

  getClearButton() {
    return wrapper.find('.image-map-controls__button--clear');
  },

  clear() {
    this.getClearButton().trigger('click');
  },

  /**
     * @param {string} type either 'rect' or 'circle'
     */
  getAreas(type = null) {
    const selector = type ? `.image-map-area--${type}` : '.image-map-area';
    return wrapper.findAll(selector);
  },

  selectNthArea(nth) {
    wrapper.findAll('.image-map-area').at(nth).trigger('click');
  },

  getDeleteButton() {
    return wrapper.find('.image-map-controls__button--delete');
  },

  useInteralPage() {
    wrapper.find('input[name="internalVsExternal"][value="internal"]').trigger('click');
  },

  useExternalUrl() {
    wrapper.find('input[name="internalVsExternal"][value="external"]').trigger('click');
  },

});

let changeObserver = null;
const mockCreateChangeObservable = () => Rx.Observable.create((observer) => {
  changeObserver = observer;
});

describe('Image mapper component', () => {
  let wrapper = null;
  let helper;

  beforeEach(() => {
    wrapper = mount(ImageMapper, {
      propsData: {
        name: 'foo',
      },

      provide: {
        $createTreeFieldChangeObservable: mockCreateChangeObservable,
        $confirm: () => true,
      },
    });

    helper = createHelper(wrapper);
  });

  it('displays two add buttons and the viewport initally', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons.at(0).isVisible()).toBeTruthy();
    expect(buttons.at(1).isVisible()).toBeTruthy();
    expect(buttons.at(2).isVisible()).toBeFalsy(); // Delete Selected button
    expect(wrapper.contains('.image-map-viewport')).toBeTruthy();
    expect(wrapper.contains('.image-map-area')).toBeFalsy();
  });

  it('returns a new id when call getNewId()', () => {
    const { vm } = wrapper;
    expect(vm.getNewId()).toBe(1);

    vm.areas.push(vm.createNewAreaData('rect'));
    expect(vm.getNewId()).toBe(2);

    vm.areas.push(vm.createNewAreaData('circle'));
    vm.areas.push(vm.createNewAreaData('circle'));
    expect(vm.getNewId()).toBe(4);
  });

  it('adds areas when I click Add button', () => {
    expect(helper.getAreas().length).toBe(0);

    helper.addRect();
    helper.addRect();
    helper.addRect();
    helper.addCircle();
    helper.addCircle();
    expect(helper.getAreas().length).toBe(5);
    expect(helper.getAreas('rect').length).toBe(3);
    expect(helper.getAreas('circle').length).toBe(2);
  });

  it('deletes an area when it\'s selected and I click Delete button', () => {
    helper.addRect();
    helper.addRect();
    helper.addRect();
    helper.addCircle();
    helper.addCircle();
    expect(helper.getAreas().length).toBe(5);
    expect(helper.getAreas('rect').length).toBe(3);
    expect(helper.getAreas('circle').length).toBe(2);
    expect(helper.getDeleteButton().isVisible()).toBeFalsy();

    helper.selectNthArea(2);
    expect(helper.getDeleteButton().isVisible()).toBeTruthy();

    helper.getDeleteButton().trigger('click');
    expect(helper.getAreas('rect').length).toBe(2);
    expect(helper.getAreas('circle').length).toBe(2);
    expect(helper.getAreas().length).toBe(4);
    expect(helper.getDeleteButton().isVisible()).toBeFalsy();
  });

  it('deletes all areas when I click Clear button and clear select state', () => {
    helper.addRect();
    helper.addRect();
    helper.addCircle();
    expect(helper.getAreas().length).toBe(3);

    helper.selectNthArea(1);
    expect(helper.getDeleteButton().isVisible()).toBeTruthy();

    helper.clear();
    expect(wrapper.contains('.image-map-controls__button--clear')).toBeFalsy();
    expect(helper.getDeleteButton().isVisible()).toBeFalsy();
  });

  it('updates selected area data when selected area UI updated', (done) => {
    helper.addRect();
    helper.addCircle();

    helper.selectNthArea(0);
    helper.useExternalUrl();
    const externalUrlInput = wrapper.find('input[name="externalUrl"]');
    externalUrlInput.element.value = 'http://test.com/';
    externalUrlInput.trigger('input');

    helper.selectNthArea(1);
    helper.useInteralPage();

    // Change observable created in $nextTick in `ImageMapControl`
    wrapper.vm.$nextTick(() => {
      changeObserver.next({
        id: 3,
        title: 'Foobar',
      });

      const areasData = wrapper.vm.areas;
      expect(areasData.length).toBe(2);

      expect(areasData[0].useInternalPage).toBeFalsy();
      expect(areasData[0].externalUrl).toBe('http://test.com/');
      expect(areasData[0].internalPageTitle).toBe(null);
      expect(areasData[0].internalPageId).toBe(null);

      expect(areasData[1].useInternalPage).toBeTruthy();
      expect(areasData[1].internalPageTitle).toBe('Foobar');
      expect(areasData[1].internalPageId).toBe(3);

      done();
    });
  });
});
