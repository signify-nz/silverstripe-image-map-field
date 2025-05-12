<?php
namespace ImageMapField\Forms;

use SilverStripe\Forms\TextField;
use SilverStripe\Forms\FieldList;
use SilverStripe\View\Requirements;
use SilverStripe\Assets\Image;
use SilverStripe\Control\HTTPRequest;

class ImageMapField extends TextField
{
    /**
     * @var string
     */
    protected $fieldHolderTemplate = "ImageMapField";

    /**
     * @var array
     */
    private static $allowed_actions = array(
        'tree'
    );

    /**
     * @var Image
     */
    protected $image = null;

    /**
     * @var DatalessTreeDropdownField
     */
    protected $treeField = null;

    /**
     * Returns an input field.
     *
     * @param string $name
     * @param null|string $title
     * @param string $value
     * @param null|int $maxLength Max characters to allow for this field. If this value is stored
     * against a DB field with a fixed size it's recommended to set an appropriate max length
     * matching this size.
     * @param null|Form $form
     */
    public function __construct($name, $title = null, $value = '', $maxLength = null, $form = null)
    {
        parent::__construct($name, $title, $value, $maxLength, $form);
    }

    /**
     * @var array $properties
     * @return DBHTMLText
     */
    public function FieldHolder($properties = array())
    {
        Requirements::javascript('quantum-dragons/image-map-field:client/dist/app.js');
        return parent::FieldHolder($properties);
    }

    /**
     * @return DatalessTreeDropdownField
     */
    public function TreeField()
    {
        if (!$this->treeFeild) {
            $this->treeField = $this->createDatalessSiteTreeField();
        }
        return $this->treeField;
    }

    /**
     * @var Image $image
     * @return ImageMapField
     */
    public function setImage($image)
    {
        $this->image = $image;
        return $this;
    }

    /**
     * @return ImageMapField
     */
    public function getImage()
    {
        return $this->image;
    }

    /**
     * @return DBHTMLText
     */
    public function Value()
    {
        return trim(parent::Value() ?? '');
    }

    /**
     * @return DatalessTreeDropdownField
     */
    private function createDatalessSiteTreeField()
    {
        $field = DatalessTreeDropdownField::create(
            $this->Name,
            null,
            \SilverStripe\CMS\Model\SiteTree::class
        );
        $field->setForm($this->getForm());

        return $field;
    }

    /**
     * Get the whole tree of a part of the tree via an AJAX request.
     *
     * @param HTTPRequest $request
     * @return HTTPResponse
     * @throws Exception
     */
    public function tree(HTTPRequest $request)
    {
        if (!$this->treeFeild) {
            $this->treeField = $this->createDatalessSiteTreeField();
        }
        return $this->treeField->tree($request);
    }
}
